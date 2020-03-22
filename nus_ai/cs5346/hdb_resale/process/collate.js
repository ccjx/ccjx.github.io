const neatCsv = require('neat-csv')
const fsPromises = require('fs').promises
const path = require('path')
const fetch = require('node-fetch')
// const {multiPolygon, point} = require('@turf/helpers')
const turf = require('@turf/turf')


let dataPath = path.join("output.json")


void async function() {
    try{
        let salePricesJson = await fsPromises.readFile(dataPath)
        let salePrices = JSON.parse(salePricesJson)

        let allMonths = [...new Set(salePrices.map(x => x.month))]
        let allTowns = [...new Set(salePrices.map(x => x.district))]
        
        let consolidatedPrices = {}
        for(let month of allMonths){
            consolidatedPrices[month] = {}
            for(let town of allTowns){
                consolidatedPrices[month][town] = {
                    n: 0,
                    monthDt: Date.parse(month),
                    perSqmPriceSum: 0,
                    town,
                }
            }
        }
            
        for(let salePrice of salePrices){
            let selectedMonthTown = consolidatedPrices[salePrice.month][salePrice.district]
            selectedMonthTown.n += 1
            selectedMonthTown.perSqmPriceSum += salePrice.perSqmPrice
        }

        for(let month in consolidatedPrices){
            for(let town in consolidatedPrices[month]){
                consolidatedPrices[month][town].meanPerSqmPrice = consolidatedPrices[month][town].perSqmPriceSum / consolidatedPrices[month][town].n
            }
            let rolledTowns = Object.values(consolidatedPrices[month])
            consolidatedPrices[month] = {
                towns: rolledTowns,
                month: month,
                monthDt: rolledTowns[0].monthDt
            }
        }
        consolidatedPrices = Object.values(consolidatedPrices)

        let jsonContent = JSON.stringify(consolidatedPrices)
        fsPromises.writeFile("consolidatedPrices.json", jsonContent, 'utf8')
    }
    
	catch(ex){
        console.log("Error: ", ex)
    }
}();