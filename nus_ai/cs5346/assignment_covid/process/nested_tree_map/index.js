var fs = require('fs');
var path = require('path');
var parse = require('csv-parse');
var FuzzySearch = require('fuzzy-search');

function processAll(covid19summary, countryContinent, countryCodes, latlongList){
    // reduce -- Take Country - City as key and organize into dict of objs
    for (const curr of covid19summary) {

        //clean up due to data set and limitations of joined data sets
        if(curr[3] == "('St. Martin',)") { curr[3] = 'St. Martin' }
        if(curr[3] == "Republic of Ireland") { curr[3] = 'Ireland' }
        if(curr[3] == "occupied Palestinian territory" ) { curr[3] = 'Israel' }
        if(curr[3] == "North Ireland") { curr[3] = 'UK' }
        if(curr[3] == "Channel Islands" ) { curr[3] = 'UK' }
        if(curr[3] == "Congo (Kinshasa)" ) { curr[3] = 'Congo' }
    }
    let cumu = {}
    for (const curr of covid19summary) {
        //Take Country - City as key and organize into dict of objs
        if(curr[0].trim() == "SNo") {
            // ignore, header
            continue;
        }

        let key = curr[3].trim() + curr[2].trim()

        if (cumu.hasOwnProperty(key) && cumu[key].confirmed > Number(curr[5])){
            // if exists, update obj to sum up
            cumu[key].confirmed = Number(curr[5])
            cumu[key].deaths = Number(curr[6])
            cumu[key].recovered = Number(curr[7])
        }
        else{
            // if doesn't exist, create obj
            cumu[key] = {
                state: curr[2],
                country: curr[3],
                confirmed: Number(curr[5]),
                deaths: Number(curr[6]),
                recovered: Number(curr[7])
            }
        }
    }

    const searcher = new FuzzySearch(countryContinent, ['1'], {
        caseSensitive: false,
        sort: true
    });
    for (let [key, cumuObj] of Object.entries(cumu)) {
        const continents = searcher.search(cumuObj.country);
        if( !continents[0] ) {
            console.log(cumuObj.country, "not found by searcher (continent)")
        }
        else{
            cumuObj.continent = continents[0][0]

        }
    }

    
    /////////////////////////////////////////////////////////////////////////////
    //prepare flat country data
    let cumuCopyPreMix = {
        ...cumu
    }
    const codeSearcher = new FuzzySearch(countryCodes, ['0'], {
        caseSensitive: false,
        sort: true
    });
    let cumuCopy = {}
    for (let [key, cumuObj] of Object.entries(cumuCopyPreMix)) {
        if (cumuCopy.hasOwnProperty(cumuObj.country)){
            // if exists, update obj to sum up
            cumuCopy[cumuObj.country].confirmed += Number(cumuObj.confirmed)
            cumuCopy[cumuObj.country].deaths += Number(cumuObj.deaths)
            cumuCopy[cumuObj.country].recovered += Number(cumuObj.recovered)
        }
        else{
            // if doesn't exist, create obj
            cumuCopy[cumuObj.country] = {
                country: cumuObj.country,
                confirmed: Number(cumuObj.confirmed),
                deaths: Number(cumuObj.deaths),
                recovered: Number(cumuObj.recovered)
            }
        }
    }
    for (let [key, cumuObj] of Object.entries(cumuCopy)) {
        const codes = codeSearcher.search(cumuObj.country);
        if( !codes[0] ) {
            console.log(cumuObj.country, "not found by searcher (codes)")
        }
        else{
            cumuObj.countryCode = Number(codes[0][3])
            cumuObj.countryAlpha2 = codes[0][1].toLowerCase()
            // console.log(latlongList[cumuObj.countryAlpha2], cumuObj.countryAlpha2)
            cumuObj.geolocation = [Number(latlongList[cumuObj.countryAlpha2].long), Number(latlongList[cumuObj.countryAlpha2].lat)]
        }
    }
    let outputCountryList = []
    for (let [key, cumuObj] of Object.entries(cumuCopy)) {
        outputCountryList.push(cumuObj)
    }

    var jsonContentCountryCode = JSON.stringify(outputCountryList);
    fs.writeFileSync("jsonContentCountryCode.json", jsonContentCountryCode, 'utf8')

    //prepare flat country data -- END
    /////////////////////////////////////////////////////////////////////////////
    
    

    /////////////////////////////////////////////////////////////////////////////
    //prepare treemap data

    //prep continents
    treemapData = {
        name: "Continents",
        children: []
    }
    
    for (let [key, cumuObj] of Object.entries(cumu)) {
        let found = false
        let foundElement = {}
        for(let storedContinent of treemapData.children){
            if(storedContinent.name === cumuObj.continent){
                found = true
                foundElement = storedContinent
            }
        }
        if(!found){
            foundElement = {
                name: cumuObj.continent,
                children: []
            }
            treemapData.children.push(foundElement)
        }


        //prep countries
        let foundCountry = false
        let foundCountryElement = {}
        for(let storedCountry of foundElement.children){
            if(storedCountry.name === cumuObj.country){
                foundCountry = true
                foundCountryElement = storedCountry
            }
        }
        if(!foundCountry){
            foundCountryElement = {
                name: cumuObj.country,
                children: []
            }
            foundElement.children.push(foundCountryElement)
        }

        //if country has no state, set as leaf node
        if(cumuObj.state.trim() === "") {
            foundCountryElement.deaths = cumuObj.deaths
            foundCountryElement.confirmed = cumuObj.confirmed
            foundCountryElement.recovered = cumuObj.recovered
            continue;
        }
        
        
        //prep states
        let foundState = false
        let foundStateElement = {}
        for(let storedState of foundCountryElement.children){
            if(storedState.name === cumuObj.state){
                foundState = true
                foundStateElement = storedState
            }
        }
        if(!foundState){
            foundStateElement = {
                name: cumuObj.state,
                deaths: cumuObj.deaths,
                confirmed: cumuObj.confirmed,
                recovered: cumuObj.recovered,
            }
            foundCountryElement.children.push(foundStateElement)
        }

    }
    var jsonContent = JSON.stringify(treemapData);
    fs.writeFileSync("output.json", jsonContent, 'utf8')
    //prepare treemap data --- END
    /////////////////////////////////////////////////////////////////////////////
    
}

const dataRawPath = path.join("..", "..", "dataraw")
const covid19summaryPath = path.join(dataRawPath, "novel-corona-virus-2019-dataset", "covid_19_data.csv")
covid19summaryCsv = fs.readFileSync(covid19summaryPath)
countryContinentCsv = fs.readFileSync(path.join(dataRawPath, 'country_continent.csv'))
countrycodesCsv = fs.readFileSync(path.join(dataRawPath, 'countrycodes.csv'))
latlongJson = fs.readFileSync(path.join(dataRawPath, 'countrycode-latlong.min.json'))
latlongList = JSON.parse(latlongJson)

parse(covid19summaryCsv, function(err, covid19summary){
    parse(countryContinentCsv, function(err, countryContinent){
        parse(countrycodesCsv, function(err, countryCodes){
            processAll(covid19summary, countryContinent, countryCodes, latlongList)
        })
    })
})