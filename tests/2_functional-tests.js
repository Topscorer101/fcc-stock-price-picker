/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);


// TODO: You will create all of the functional tests in `tests/2_functional-tests.js`
// TODO: All 5 functional tests are complete and passing.
suite('Functional Tests', function() {

    suite('GET /api/stock-prices => stockData object', function() {

        test('1 stock', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'lly' })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.property(res.body.stockData, 'stock');
                assert.property(res.body.stockData, 'price');
                assert.property(res.body.stockData, 'likes');
                done();
            });
        });

        test('1 stock with like', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'burl', like: true })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.isAtLeast(res.body.stockData.likes, 1);
                done();
            })
        });

        test('1 stock with like again (ensure likes arent double counted)', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'burl', like: true })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.isAtMost(res.body.stockData.likes, 1);
                done();
            })
        });

        test('2 stocks', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: ['burl', 'goog'] })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.isArray(res.body.stockData);
                done();
            })
        });

        test('2 stocks with like', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: ['burl', 'goog'], like: true })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.property(res.body.stockData[0], 'rel_likes');
                assert.property(res.body.stockData[1], 'rel_likes');
                done();
            })
        });

    });

});
