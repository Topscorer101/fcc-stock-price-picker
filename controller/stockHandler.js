const request = require('request');


// TODO: Use a stock handler function to retrieve the stock data
module.exports = async (stock, model, isLiked, userIp) => {
    return new Promise((resolve, reject) => {
        // The source for the stock data
        let stockSource = "https://api.iextrading.com/1.0/stock/"
        + stock + "/quote";

        // Get the stock data from the site
        request(stockSource, { json: true }, (err, res, body) => {
            if (err) {
                return console.log(err);
                reject();
            }
            else {
                let stockName = body.symbol;
                let stockPrice = body.latestPrice;

                /* TODO: Look for the requested stock in the database,
                and create a new document, if it doesn't already exist */
                model.findOrCreate(
                    // Stock to look for
                    { stock: stockName },
                    // Properties to add, if it is has to be created
                    {
                        price: stockPrice,
                        likes: 0,
                        ip_addresses: []
                    },
                    // Callback
                    (err, stock) => {
                        if (err) {
                            console.log("Database Error: " + err);
                            reject();
                        }
                        else {
                            /* If like is checked when model is first created */
                            if (stock.likes === 0 && isLiked) {
                                // Add a like
                                stock.likes++;
                                /* Add user IP to the array, to prevent multiple submissions */
                                stock.ip_addresses.push(userIp);
                            }
                            /* If the IP address isn't already in the stock's array,
                            and the stock is liked */
                            else if (!stock.ip_addresses.includes(userIp) && isLiked) {
                                // Add a like
                                stock.likes++
                                /* Add user IP to the array, to prevent multiple submissions */
                                stock.ip_addresses.push(userIp);
                            }
                            stock.save()
                            resolve();
                        }
                    }
                )
            }
        });
    })
}


