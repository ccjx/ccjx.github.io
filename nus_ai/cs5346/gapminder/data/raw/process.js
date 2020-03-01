var fs = require('fs');
var parse = require('csv-parse');
var FuzzySearch = require('fuzzy-search');

function processAll(population, lifeExp, income, countryContinent){
    let years = {}
    for(let yearIndex=1; yearIndex<income[0].length; yearIndex++){
        let countries = {}
        for(let countryIndex=1; countryIndex<income.length; countryIndex++){
            let countryName = income[countryIndex][0]
            countries[countryName] = {
                "country": countryName,
                "income": income[countryIndex][yearIndex] ? Number(income[countryIndex][yearIndex]) : null,
            }
        }
        years[income[0][yearIndex]] = {
            year: income[0][yearIndex],
            countries: countries
        }
    }

    for(let yearIndex=1; yearIndex<lifeExp[0].length; yearIndex++){
        let countries = years[lifeExp[0][yearIndex]] || {
            countries: {}
        }
        countries = countries.countries
        for(let countryIndex=1; countryIndex<lifeExp.length; countryIndex++){
            let countryName = lifeExp[countryIndex][0]
            let currentCountry = countries[countryName] || {
                "country": countryName,
                "income": null,
            }

            currentCountry["lifeExp"] = lifeExp[countryIndex][yearIndex] ? Number(lifeExp[countryIndex][yearIndex]) : null
            countries[countryName] = currentCountry
        }
        years[lifeExp[0][yearIndex]] = {
            year: lifeExp[0][yearIndex],
            countries: countries
        }
    }


    for(let yearIndex=1; yearIndex<population[0].length; yearIndex++){
        let countries = years[population[0][yearIndex]] || {
            countries: {}
        }
        countries = countries.countries
        for(let countryIndex=1; countryIndex<population.length; countryIndex++){
            let countryName = population[countryIndex][0]
            let currentCountry = countries[countryName] || {
                "country": countryName,
                "income": null,
                "lifeExp": null,
            }

            currentCountry["population"] = population[countryIndex][yearIndex] ? Number(population[countryIndex][yearIndex]) : null
            countries[countryName] = currentCountry
        }
        years[population[0][yearIndex]] = {
            year: population[0][yearIndex],
            countries: countries
        }
    }

    const searcher = new FuzzySearch(countryContinent, ['1'], {
        caseSensitive: false,
        sort: true
    });
    for (let [year, yearObj] of Object.entries(years)) {
        for (let [country, countryObj] of Object.entries(yearObj.countries)) {

            const continents = searcher.search(country);
            if( !continents[0] ) {
                console.log(country)
            }
            else{
                countryObj.continent = continents[0][0]

            }
        }
    }
    
    let yearOut = []
      
    for (let [year, yearObj] of Object.entries(years)) {
        let newObj = {}
        newObj.year = yearObj.year
        newObj.countries = []
        for (let [country, countryObj] of Object.entries(yearObj.countries)) {
            newObj.countries.push(countryObj)
        }
        yearOut.push(newObj)
    }

    var jsonContent = JSON.stringify(yearOut);
    fs.writeFileSync("output.json", jsonContent, 'utf8')

    // {
    //     "1800": {
    //         countries: {
    //             "test": {

    //             }
    //         }
    //     }
    // }
    /*
    [
        {
            year: "1800",
            countries: [
                "continent": "europe",
                "country": "Yugoslavia",
                "income": null,
                "life_exp": null,
                "population": 4687422
            ]
        }
    ]
    */
}

populationCsv = fs.readFileSync(__dirname+'/population_total.csv')
incomeCsv = fs.readFileSync(__dirname+'/income_per_person_gdppercapita_ppp_inflation_adjusted.csv')
lifeExpCsv = fs.readFileSync(__dirname+'/life_expectancy_years.csv')
countryContinentCsv = fs.readFileSync(__dirname+'/country_continent.csv')

parse(populationCsv, function(err, population){
    parse(incomeCsv, function(err, income){
        parse(lifeExpCsv, function(err, lifeExp){
            parse(countryContinentCsv, function(err, countryContinent){
                processAll(population, lifeExp, income, countryContinent)
            })
        })
    })
})