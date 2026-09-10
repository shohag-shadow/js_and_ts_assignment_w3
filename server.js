const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const path = require('path');
const fs = require('fs');
const { error } = require('console');
//cors middlewire
app.use(cors());
//used like a cache so that files are not accessed in every get request
let highestPriceData;
let lowestPriceData;
let mostPopularData;
let imagesRoute;
try {
    //used sync so that thease three files are already ready before server starts
    highestPriceData = JSON.parse(fs.readFileSync('./data/highest_price.json', 'utf8'));
    lowestPriceData = JSON.parse(fs.readFileSync('./data/lowest_price.json', 'utf-8'));
    mostPopularData = JSON.parse(fs.readFileSync('./data/most_popular.json', 'utf-8'));
    imagesRoute = fs.readdirSync(path.join(__dirname, 'images'));
    imagesRoute = imagesRoute.map((route) => "/images/" + route);

}
catch (err) {
    console.error(err);
    console.log("There was error during accessing or parsing a file");
}
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
    let limit = Number(req.query.limit) || 10;
    let resposeData;
    if (mostPopular) {
        resposeData = {
            ...mostPopularData,
            Result: {
                ...mostPopularData.Result,
                Count: limit,
                Items: mostPopularData.Result.Items.slice(0, limit)
            }
        };
    }
    if (lowestPrice) {
        resposeData = {
            ...lowestPriceData,
            Result: {
                ...lowestPriceData.Result,
                Count: limit,
                Items: lowestPriceData.Result.Items.slice(0, limit)
            }
        }
    }
    if (highestPrice) {
        resposeData = {
            ...highestPriceData,
            Result: {
                ...highestPriceData.Result,
                Count: limit,
                Items: highestPriceData.Result.Items.slice(0, limit)
            }
        }
    }
    res.json(resposeData);
});
app.get("/images", (req, res) => {
    res.json(imagesRoute);
});
app.get("/config/maps", (req, res) => {
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY || "" });
});
app.use(express.static(__dirname));

app.listen(3000,
    () => console.log("Server running on port 3000 \n You can visit http://localhost:3000 to access it"));