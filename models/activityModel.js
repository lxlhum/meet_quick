var config = require('../profile.json');
var Model = require(config.models_factary)("activity");

module.exports = {
    Model:Model.Model,
    PageQuery:Model.PageQuery
};