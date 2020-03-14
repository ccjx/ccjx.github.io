var fs = require('fs');
var path = require('path');
var parse = require('csv-parse');
function ageMapper(age){
    age=age.trim()
    if(Number(age) <= 9){
        return "0-9"
    }
    if(Number(age) <= 19){
        return "10-19"
    }
    if(Number(age) <= 29){
        return "20-29"
    }
    if(Number(age) <= 39){
        return "30-39"
    }
    if(Number(age) <= 49){
        return "40-49"
    }
    if(Number(age) <= 59){
        return "50-59"
    }
    if(Number(age) <= 69){
        return "60-69"
    }
    if(Number(age) <= 79){
        return "70-79"
    }
    if(Number(age) <= 89){
        return "80-89"
    }
    if(Number(age) > 89){
        return "90-99"
    }
    if(Number(age) > 99){
        return "100-109"
    }
    if(age == "36-45"){
        return "40-49"
    }
    if(age == "0-10"){
        return "0-9"
    }
    if(age == "10-19"){
        return "10-19"
    }
    if(age == "20-29"){
        return "20-29"
    }
    if(age == "30-39"){
        return "30-39"
    }
    if(age == "40-49"){
        return "40-49"
    }
    if(age == "50-59"){
        return "50-59"
    }
    if(age == "60-69"){
        return "60-69"
    }
    if(age == "70-79"){
        return "70-79"
    }
    if(age == "80-89"){
        return "80-89"
    }
    if(age == "27-40"){
        return "30-39"
    }
    if(age == "38-68"){
        return "50-59"
    }
    if(age == "60-60"){
        return "60-69"
    }
    if(age == "40-89"){
        return "60-69"
    }
    if(age == "13-19"){
        return "10-19"
    }
    if(age == "80-80"){
        return "80-89"
    }
    if(age == "0-6"){
        return "0-9"
    }
    if(age == "0-18"){
        return "0-9"
    }
    
    if(age == "23-72"){
        return -1
    }
    if(age == "16-80"){
        return -1
    }
    if(age == "18-65"){
        return -1
    }
    if(age == "22-80"){
        return -1
    }
    if(age == "19-77"){
        return -1
    }
    if(age == "8-68"){
        return -1
    }
    if(age == "21-72"){
        return -1
    }
    return null
}



function processAll(covid19linelistCsvData, undataPopulationData){
    let lineList = []

    for (const curr of covid19linelistCsvData) {

        if(curr[0].trim() === "ID") {
            continue
        }
        if(curr[1].trim() === "N/A") {
            continue
        }
        if(curr[1].trim() === "NA") {
            continue
        }
        if(curr[1].trim() === "") {
            continue
        }
        if(curr[1].trim() == null) {
            continue
        }
        if(curr[2] == ""){
            continue
        }
        

        let procObj = {
            age: curr[1],
            gender: curr[2].toLowerCase(),
            city: curr[3],
            state: curr[4],
            country: curr[5]
        }


        procObj.ageBracket = ageMapper(procObj.age)
        if(procObj.ageBracket == null) {
            console.log("Unable to map age: ", procObj.age)   
        }
        
        if(procObj.ageBracket != -1) {
            lineList.push(procObj)
        }
        
    }
    console.log("Rows", lineList.length)
    var jsonContent = JSON.stringify(lineList);
    fs.writeFileSync("line-list-data.json", jsonContent, 'utf8')
    

    //// process demo data
    //
    let maxYear = {}
    for(const undata of undataPopulationData){
        if(undata[0] == "Country or Area") {
            continue
        }
        if(maxYear[undata[0]]){
            if(Number(maxYear[undata[0]]) < Number(undata[1])){
                maxYear[undata[0]] = undata[1]
            }
        }
        else{
            maxYear[undata[0]] = undata[1]
        }
    }

    let country = {}
    for(const undata of undataPopulationData){
        if(undata[0] == "Country or Area") {
            continue
        }
        if(maxYear[undata[0]] == undata[1]){
            if(!country.hasOwnProperty(undata[0])){
                country[undata[0]] = {
                    "Male": {},
                    "Female": {},
                    "Both Sexes": {}
                }
            }
            country[undata[0]][undata[3]][undata[4]] = Number(undata[8])
        }
    }

    
    var jsonContent = JSON.stringify(country);
    fs.writeFileSync("country-age-gender-population.json", jsonContent, 'utf8')
}

const dataRawPath = path.join("..", "..", "dataraw")
const covid19linelistPath = path.join(dataRawPath, "novel-corona-virus-2019-dataset", "COVID19_open_line_list.csv")
const undataPopulationPath = path.join(dataRawPath, "undata-country-age-gender", "UNdata_Export_20200312_154311814.csv")
covid19linelistCsv = fs.readFileSync(covid19linelistPath)
undataPopulationCsv = fs.readFileSync(undataPopulationPath)

// countryContinentCsv = fs.readFileSync(path.join(dataRawPath, 'country_continent.csv'))
// countrycodesCsv = fs.readFileSync(path.join(dataRawPath, 'countrycodes.csv'))
// latlongJson = fs.readFileSync(path.join(dataRawPath, 'countrycode-latlong.min.json'))
// latlongList = JSON.parse(latlongJson)


parse(covid19linelistCsv, function(err, covid19linelistCsvData){
    parse(undataPopulationCsv, function(err2, undataPopulationData){
        console.log(err2)
        processAll(covid19linelistCsvData, undataPopulationData)
    })
})
