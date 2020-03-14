var fs = require('fs');
var path = require('path');
var parse = require('csv-parse');


const dataRawPath = path.join("..", "..", "dataraw")
const confirmedTimePath = path.join(dataRawPath, "novel-corona-virus-2019-dataset", "time_series_covid_19_confirmed.csv")
const deathsTimePath = path.join(dataRawPath, "novel-corona-virus-2019-dataset", "time_series_covid_19_deaths.csv")
const recoveredTimePath = path.join(dataRawPath, "novel-corona-virus-2019-dataset", "time_series_covid_19_recovered.csv")
confirmedTimeCsv = fs.readFileSync(confirmedTimePath)
deathsTimeCsv = fs.readFileSync(deathsTimePath)
recoveredTimeCsv = fs.readFileSync(recoveredTimePath)

parse(confirmedTimeCsv, function(err, confirmedTime){
    parse(deathsTimeCsv, function(err, deathsTime){
        parse(recoveredTimeCsv, function(err, recoveredTime){
            processAll(confirmedTime, deathsTime, recoveredTime)
        })
    })
})
function processAll(confirmedTime, deathsTime, recoveredTime){
    let countries = {}
    for(let i=1; i<confirmedTime.length; i++){
        if(!countries.hasOwnProperty(confirmedTime[i][1])){
            countries[confirmedTime[i][1]] = {
                country: confirmedTime[i][1],
                timeseries: []
            }
        }

        for(let j=4; j<confirmedTime[0].length -1; j++){
            let foundItem = countries[confirmedTime[i][1]].timeseries.find(ts => ts.dateDt == Date.parse(confirmedTime[0][j]))

            if(foundItem == undefined){
                countries[confirmedTime[i][1]].timeseries.push({
                    rawDate: confirmedTime[0][j],
                    dateDt: Date.parse(confirmedTime[0][j]),
                    confirmed: Number(confirmedTime[i][j]),
                    deaths: Number(deathsTime[i][j]),
                    recovered: Number(recoveredTime[i][j]),
                });
            }
            else {
                foundItem.confirmed += Number(confirmedTime[i][j])
                foundItem.deaths += Number(deathsTime[i][j])
                foundItem.recovered += Number(recoveredTime[i][j])
            }
        }
    }

    let toDelete = []
    for (let [key, countryObj] of Object.entries(countries)) {
        if(countryObj.timeseries.filter(t => t.recovered + t.confirmed + t.deaths == 0).length == countryObj.timeseries.length){
            toDelete.push(key)
        }
    }

    for(let del of toDelete){
        delete countries[del]
    }

    
    // for (let [key, countryObj] of Object.entries(countries)) {
    //     countryObj.timeseries[0].sumConfirmed = countryObj.timeseries[0].confirmed
    //     countryObj.timeseries[0].sumDeaths = countryObj.timeseries[0].deaths
    //     countryObj.timeseries[0].sumRecovered = countryObj.timeseries[0].recovered
    //     for(let i=1; i<countryObj.timeseries.length; i++){
    //         countryObj.timeseries[i].sumConfirmed = countryObj.timeseries[i-1].sumConfirmed + countryObj.timeseries[i].confirmed
    //         countryObj.timeseries[i].sumDeaths = countryObj.timeseries[i-1].sumDeaths + countryObj.timeseries[i].deaths
    //         countryObj.timeseries[i].sumRecovered = countryObj.timeseries[i-1].sumRecovered + countryObj.timeseries[i].recovered
    //     }
    // }

    var jsonContent = JSON.stringify(countries);
    fs.writeFileSync("time-series-data.json", jsonContent, 'utf8')
}