const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const { error } = require('console');
let highestPriceData;
let lowestPriceData;
let mostPopularData;
try {
    highestPriceData = JSON.parse(fs.readFileSync('./data/highest_price.json', 'utf8'));
    lowestPriceData = JSON.parse(fs.readFileSync('./data/lowest_price.json', 'utf-8'));
    mostPopularData = JSON.parse(fs.readFileSync('./data/most_popular.json', 'utf-8'));
}
catch (err) {
    console.error(err);
    console.log("There was error during accessing or parsing a file");
}
app.use(express.static(__dirname));
app.get("/get-property", (req, res) => {
    let numberofQuery = 0;
    let mostPopular = Boolean(req.query['most-popular']);
    if (mostPopular) numberofQuery++;
    let lowestPrice = Boolean(req.query['lowest-price']);
    if (lowestPrice) numberofQuery++;
    let highestPrice = Boolean(req.query['highest-price']);
    if (highestPrice) numberofQuery++;
    if (numberofQuery > 1) {
        res.status(422).json({ error: "You cannot use more than one parameter" });
    }
    let limit = Number(req.query.limit);
    let resposeData;
    if (mostPopular) {
        responseData = {
            ...mostPopularData,
            Result: {
                ...mostPopularData.Result,
                Items: mostPopularData.Result.Items.slice(0, limit)
            }
        };
        res.json(responseData);
    }
    res.json(resposeData);
});
app.listen(3000,
    () => console.log("Server running on port 3000 \n You can visit http://localhost:3000 to access it"));