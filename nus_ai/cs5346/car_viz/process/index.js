const neatCsv = require('neat-csv')
const fsPromises = require('fs').promises
const path = require('path')
const fetch = require('node-fetch')
// const {multiPolygon, point} = require('@turf/helpers')
const turf = require('@turf/turf')
const Bottleneck = require("bottleneck/es5");

let dataDirPath = path.join("..", "dataraw")
let annualNewCarsMakePath = path.join(dataDirPath, 'annual-new-registrations-of-cars-by-make', 'total-annual-new-registration-by-make.csv')
let coeResultsPath = path.join(dataDirPath, 'coe-bidding-results', 'coe-results.csv')
let stiPath = path.join(dataDirPath, 'STI.csv')
let residentLongTermRatePath = path.join(dataDirPath, 'resident-long-term-unemployment-rate', 'resident-long-term-unemployment-rate-annual.csv')
let monthlyNewRegMakePath = path.join(dataDirPath, 'monthly-new-registration-of-cars-by-make', 'new-registration-of-cars-by-make.csv')

void async function() {
    try{
        let annualNewCarsMakeFile = await fsPromises.readFile(annualNewCarsMakePath)
        let coeResultsFile = await fsPromises.readFile(coeResultsPath)
        let stiFile = await fsPromises.readFile(stiPath)
        let residentLongTermRateFile = await fsPromises.readFile(residentLongTermRatePath)
        let monthlyNewRegMakeFile = await fsPromises.readFile(monthlyNewRegMakePath)
        
        let annualNewCarsMake = await neatCsv(annualNewCarsMakeFile)
        let coeResults = await neatCsv(coeResultsFile)
        let sti = await neatCsv(stiFile)
        let residentLongTermRate = await neatCsv(residentLongTermRateFile)
        let monthlyNewRegMake = await neatCsv(monthlyNewRegMakeFile)


        await processCarSales(annualNewCarsMake, monthlyNewRegMake)
        await processSti(sti)
        await processCOE(coeResults)
        await processUnemployment(residentLongTermRate)
    }
	catch(ex){
        console.log("Error: ", ex)
    }
}();

async function processUnemployment(residentLongTermRate) {
    residentLongTermRate = residentLongTermRate.map(r => {
        return {
            dateDt: new Date(r.year),
            year: r.year,
            unemploymentRate: Number(r.long_term_unemployment_rate / 100),
        }
    })
    let residentLongTermRateJson = JSON.stringify(residentLongTermRate)
    await fsPromises.writeFile("residentLongTermRate.json", residentLongTermRateJson, 'utf8')
    return residentLongTermRate
}

async function processCOE(coeResults) {
    coeResults = coeResults.filter(c => c.bidding_no == 2)
    let coeProcessed = {}
    for (let coeResult of coeResults) {
        if (!coeProcessed.hasOwnProperty(coeResult.month)) {
            coeProcessed[coeResult.month] = {
                month: coeResult.month,
                dateDt: new Date(coeResult.month),
                vehicleClasses: {}
            }
        }
        coeProcessed[coeResult.month].vehicleClasses[coeResult.vehicle_class] = {
            vehicleClass: coeResult.vehicle_class,
            premium: Number(coeResult.premium),
        }
    }
    for (let month in coeProcessed) {
        coeProcessed[month].vehicleClasses = Object.values(coeProcessed[month].vehicleClasses)
    }
    coeProcessed = Object.values(coeProcessed)
    let coeResultsjson = JSON.stringify(coeProcessed)
    await fsPromises.writeFile("coeResults.json", coeResultsjson, 'utf8')
    return coeResults
}

async function processSti(sti) {
    sti = sti.map(s => {
        return {
            dateDt: new Date(s.Date),
            Date: s.Date,
            Open: Number(s.Open),
            High: Number(s.High),
            Low: Number(s.Low),
            Close: Number(s.Close),
            Volume: Number(s.Volume),
        }
    })
    let stijson = JSON.stringify(sti)
    await fsPromises.writeFile("sti.json", stijson, 'utf8')
    return sti
}

async function processCarSales(annualNewCarsMake, monthlyNewRegMake) {
    let newCarsProcessed = {}
    for (let annualNewCar of annualNewCarsMake) {
        if (!newCarsProcessed.hasOwnProperty(annualNewCar.year)) {
            newCarsProcessed[annualNewCar.year] = {
                year: annualNewCar.year,
                dateDt: new Date(Date.parse(annualNewCar.year)),
                makes: {}
            }
        }
        newCarsProcessed[annualNewCar.year].makes[annualNewCar.make.toUpperCase()] = {
            make: annualNewCar.make.toUpperCase(),
            number: Number(annualNewCar.number),
        }
    }
    for (let monthlyNewReg of monthlyNewRegMake) {
        let dateDt = new Date(Date.parse(monthlyNewReg.month))
        // console.log(dateDt.getFullYear())
        let year = dateDt.getFullYear() + ""
        if (!newCarsProcessed.hasOwnProperty(year)) {
            newCarsProcessed[year] = {
                year: year,
                dateDt: new Date(Date.parse(year)),
                makes: {}
            }
        }
        if (!newCarsProcessed[year].makes.hasOwnProperty(monthlyNewReg.make.toUpperCase())) {
            newCarsProcessed[year].makes[monthlyNewReg.make.toUpperCase()] = {
                make: monthlyNewReg.make.toUpperCase(),
                number: 0,
            }
        }
        newCarsProcessed[year].makes[monthlyNewReg.make.toUpperCase()].number += Number(monthlyNewReg.number)
    }
    let monthlyCarTypes = {}
    for (let monthlyNewReg of monthlyNewRegMake) {
        let dateDt = new Date(Date.parse(monthlyNewReg.month))
        if (!monthlyCarTypes.hasOwnProperty(monthlyNewReg.month)) {
            monthlyCarTypes[monthlyNewReg.month] = {
                month: monthlyNewReg.month,
                dateDt: dateDt,
                vehicleTypes: {}
            }
        }
        if (!monthlyCarTypes[monthlyNewReg.month].vehicleTypes.hasOwnProperty(monthlyNewReg.vehicle_type)) {
            monthlyCarTypes[monthlyNewReg.month].vehicleTypes[monthlyNewReg.vehicle_type] = {
                vehicleType: monthlyNewReg.vehicle_type,
                number: 0,
            }
        }
        monthlyCarTypes[monthlyNewReg.month].vehicleTypes[monthlyNewReg.vehicle_type].number += Number(monthlyNewReg.number)
    }
    //post process monthlyCarTypes
    for (let month in monthlyCarTypes) {
        monthlyCarTypes[month].vehicleTypes = Object.values(monthlyCarTypes[month].vehicleTypes)
    }
    monthlyCarTypes = Object.values(monthlyCarTypes)
    //post process monthlyCarTypes
    let monthlyCarTypesjson = JSON.stringify(monthlyCarTypes)
    await fsPromises.writeFile("monthlyCarTypes.json", monthlyCarTypesjson, 'utf8')
    //post process newCarsProcessed
    for (let year in newCarsProcessed) {
        newCarsProcessed[year].makes = Object.values(newCarsProcessed[year].makes)
    }
    newCarsProcessed = Object.values(newCarsProcessed)
    //post process newCarsProcessed
    let newCarsProcessedjson = JSON.stringify(newCarsProcessed)
    await fsPromises.writeFile("newCarsProcessed.json", newCarsProcessedjson, 'utf8')
}

