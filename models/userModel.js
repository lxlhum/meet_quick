var config = require('../profile.json');
var UserModel = require(config.models_factary)("user");

module.exports = {
    Model:UserModel.Model,
    PageQuery:UserModel.PageQuery
};