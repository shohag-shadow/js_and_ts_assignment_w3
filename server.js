const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
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
    // res.send("Property returned again");
    res.json(highestPriceData);
});
app.listen(3000,
    () => console.log("Server running on port 3000 \n You can visit http://localhost:3000 to access it"));