var mongoose = require('../db/db.js');
var Schema = mongoose.Schema;

var Models_Factary = function (schema_json_name, doc_name) {
    var userjson = require("../schema/" + schema_json_name + ".json");
    var UserSchema = new Schema(userjson);
    var doc_name = doc_name ? doc_name : schema_json_name;
    return mongoose.model(doc_name, UserSchema);
};
module.exports = Models_Factary;