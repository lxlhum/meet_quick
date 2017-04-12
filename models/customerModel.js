var config = require('../profile.json');
var CustomerModel = require(config.models_factary)("customer");

module.exports = CustomerModel;