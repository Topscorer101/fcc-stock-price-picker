/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate')
var request = require('request');
var stockHandler = require('../controller/stockHandler');

const CONNECTION_STRING = process.env.DB;

const StockSchema = mongoose.Schema({
    stock: String,
    price: String,
    likes: Number,
    // To make sure that multiple likes aren't submitted from the same IP
    ip_addresses: Array
})
StockSchema.plugin(findOrCreate);
const Stock = mongoose.model('Stock', StockSchema);

mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });


// TODO: Complete the project in `routes/api.js`
module.exports = function (app) {

  app.route('/api/stock-prices')
    /* TODO: I can GET /api/stock-prices with form data containing
    a Nasdaq stock ticker, and recieve back an object stockData. */
    .get((req, res) => {
        // Get the stock data from the query string
        let requestedStock = req.query.stock;

        // TODO: I can also pass along field like as true(boolean) to have my like added to the stock(s). Only 1 like per ip should be accepted.
        let liked = req.query.like || false;
        let ip = req.ip;

        // If there is only one stock provided
        if (!Array.isArray(requestedStock)) {
            requestedStock = requestedStock.toUpperCase();
            // Add the requested stock to the database
            stockHandler(requestedStock, Stock, liked, ip)
            .then(objectCreated => {
                /* Get the stock's information from the database, to send the JSON response */
                Stock.findOne(
                    { stock: requestedStock },
                    (err, stock) => {
                        if (err) console.log(err);
                        res.json({
                            "stockData":
                                {
                                    "stock": stock.stock,
                                    "price": stock.price,
                                    "likes": stock.likes
                                }
                            }
                        )
                    }
                )
            })
            .catch(err => console.log(err));
        }
        // TODO: If I pass along 2 stocks, the return object will be an array with both stock's info but instead of likes, it will display rel_likes(the difference betwwen the likes) on both.
        else {
            // Add both stocks to database
            let firstStockName = requestedStock[0].toUpperCase();
            let secondStockName = requestedStock[1].toUpperCase();

            stockHandler(firstStockName, Stock, liked, ip);
            stockHandler(secondStockName, Stock, liked, ip);

            Promise.all([
                Stock.findOne({ stock: firstStockName }),
                Stock.findOne({ stock: secondStockName })
            ])
            .then(twoStocksArr => {
                let firstStock = twoStocksArr[0];
                let secondStock = twoStocksArr[1];

                res.json({
                    "stockData": [
                        {
                            "stock": firstStock.stock,
                            "price": firstStock.price,
                            "rel_likes": firstStock.likes - secondStock.likes
                        },
                        {
                            "stock": secondStock.stock,
                            "price": secondStock.price,
                            "rel_likes": secondStock.likes - firstStock.likes
                        }
                    ]
                })
            })
            .catch(err => console.log(err));
        }
    })

};
