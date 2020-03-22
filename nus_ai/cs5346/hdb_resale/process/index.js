const neatCsv = require('neat-csv')
const fsPromises = require('fs').promises
const path = require('path')
const fetch = require('node-fetch')
// const {multiPolygon, point} = require('@turf/helpers')
const turf = require('@turf/turf')
const Bottleneck = require("bottleneck/es5");

let dataDirPath = path.join("..", "rawdata", "resale-flat-prices")
let csv1990Path = path.join(dataDirPath, 'resale-flat-prices-based-on-approval-date-1990-1999.csv')
let csv2000Path = path.join(dataDirPath, 'resale-flat-prices-based-on-approval-date-2000-feb-2012.csv')
let csv2012Path = path.join(dataDirPath, 'resale-flat-prices-based-on-registration-date-from-mar-2012-to-dec-2014.csv')
let csv2015Path = path.join(dataDirPath, 'resale-flat-prices-based-on-registration-date-from-jan-2015-to-dec-2016.csv')
let csv2017Path = path.join(dataDirPath, 'resale-flat-prices-based-on-registration-date-from-jan-2017-onwards.csv')
let planningAreasPath = path.join("..", "rawdata", "singapore-planning-areas-topojson.json")


void async function() {
    try{
        let csv1990File = await fsPromises.readFile(csv1990Path)
        let csv2000File = await fsPromises.readFile(csv2000Path)
        let csv2012File = await fsPromises.readFile(csv2012Path)
        let csv2015File = await fsPromises.readFile(csv2015Path)
        let csv2017File = await fsPromises.readFile(csv2017Path)

        let planningAreasFile = await fsPromises.readFile(planningAreasPath)
        
        let csv1990 = await neatCsv(csv1990File)
        let csv2000 = await neatCsv(csv2000File)
        let csv2012 = await neatCsv(csv2012File)
        let csv2015 = await neatCsv(csv2015File)
        let csv2017 = await neatCsv(csv2017File)

        let planningAreas = JSON.parse(planningAreasFile)

        let allLines = csv1990.concat(csv2000).concat(csv2012).concat(csv2015).concat(csv2017)
        console.log(allLines.length)

        process(allLines)
        let reducedAddresses = reduceAddresses(allLines)
        console.log(reducedAddresses.length)

        reducedAddressesLatLng = await augmentLatLong(reducedAddresses)
        addressesWithIssues = await loadIssuesLatLong()

        finalAddressList = reducedAddressesLatLng.filter(ra => ra.lat != undefined && ra.long != undefined).concat(addressesWithIssues)

        populateDistrict(finalAddressList, planningAreas.features)
        let finalAddressListJson = JSON.stringify(finalAddressList)
        await fsPromises.writeFile("finalAddressListJson.json", finalAddressListJson, 'utf8')
        matchDistrict(allLines, finalAddressList)
        
        let jsonContent = JSON.stringify(allLines)
        await fsPromises.writeFile("output.json", jsonContent, 'utf8')
    }
	catch(ex){
        console.log("Error: ", ex)
    }
}();

function process(allLines){
    for(let line of allLines){
        line.monthDt = Date.parse(line.month)
        line.resalePriceNbr = Number(line.resale_price)
        line.floorAreaSqmNbr = Number(line.floor_area_sqm)
        line.perSqmPrice = line.resalePriceNbr / line.floorAreaSqmNbr
    }
}

function reduceAddresses(addresses){
    let reduced = {}
    for(let address of addresses){
        reduced[address.block + " " + address.street_name] = {
            block: address.block,
            street_name: address.street_name
        }
    }
    let reducedArr = Object.values(reduced)

    return reducedArr
}

async function augmentLatLong(addresses){
    let reducedAddressesLatLngPath = path.join("reducedAddressesLatLngJson.json")
    let reducedAddressesLatLngFile = await fsPromises.readFile(reducedAddressesLatLngPath)
    let reducedAddressesLatLng = JSON.parse(reducedAddressesLatLngFile)
    return reducedAddressesLatLng
}
async function loadIssuesLatLong(){
    let reducedAddressesLatLngPath = path.join("reducedAddressesLatLngJsonIssues.json")
    let reducedAddressesLatLngFile = await fsPromises.readFile(reducedAddressesLatLngPath)
    let reducedAddressesLatLng = JSON.parse(reducedAddressesLatLngFile)
    return reducedAddressesLatLng
}
function populateDistrict(reducedAddressesLatLng, planningAreas){
    let polygonList = []
    for(let planningArea of planningAreas){
        let polygon = {
            multiPoly: planningArea,
            area: planningArea.properties.PLN_AREA_N
        }
        polygonList.push(polygon)
    }
    
    for(let reducedAddress of reducedAddressesLatLng){
        let pt = turf.point([Number(reducedAddress.long), Number(reducedAddress.lat)]);
        
        for(let polygon of polygonList){
            if (turf.booleanPointInPolygon(pt, polygon.multiPoly)){
                reducedAddress.town = polygon.area
                break
            }
        }

        if(reducedAddress.town == undefined){
            console.log("undefined for point (lat, long)", pt)
        }
    }
}

function matchDistrict(allLines, reducedAddressesLatLng){
    for(let line of allLines){
    
        for(let searchAddress of reducedAddressesLatLng){
            if(searchAddress.block == line.block &&
                searchAddress.street_name == line.street_name){
                    line.district = searchAddress.town
                }
        }
        if (line.district == undefined){
            console.log(line.block + " " + line.street_name, " not found in matchDistrict")
        }
    
    }
}


// const limiter = new Bottleneck({
//     maxConcurrent: 1,
//     minTime: 250
// });
// limiter.on("failed", async (error, jobInfo) => {
//     const id = jobInfo.options.id;
//     console.warn(`Job ${id} failed: ${error}`);

//     if (jobInfo.retryCount < 10) {
//         return 250
//     }
// });
// async function augmentLatLong(addresses){
//     let retAddresses = []
//     for(let address of addresses){
//         let tryFull = await limiter.schedule(() => searchAPI(address.block + " " + address.street_name))
        
//         if(tryFull.results.length > 0) {
//             address.lat = tryFull.results[0].LATITUDE
//             address.long = tryFull.results[0].LONGITUDE
//         }
//         else {
//             let tryStreet = await limiter.schedule(() => searchAPI(address.street_name))
//             if(tryStreet.results.length > 0) {
//                 address.lat = tryStreet.results[0].LATITUDE
//                 address.long = tryStreet.results[0].LONGITUDE
//             }
//             else {
//                 console.log("Unable to find " + address.street_name)
//             }
//         }
//         retAddresses.push(address)
//     }

//     let jsonContent = JSON.stringify(retAddresses)
//     await fsPromises.writeFile("reducedAddressesLatLngJson.json", jsonContent, 'utf8')
//     return retAddresses
// }


// async function searchAPI(searchTerm){
//     console.log("searching " + searchTerm)

//     let url = `https://developers.onemap.sg/commonapi/search?returnGeom=Y&getAddrDetails=Y&pageNum=1&searchVal=${searchTerm}`
//     let returnJson = await (await fetch(url)).json()

//     return returnJson

// }