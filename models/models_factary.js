var mongoose = require('../db/db.js');
var Schema = mongoose.Schema;

var Model = (schema_json_name, doc_name) => {
    var userjson = require("../schema/" + schema_json_name + ".json");
    var UserSchema = new Schema(userjson);
    var doc_name = doc_name ? doc_name : schema_json_name;
    return mongoose.model(doc_name, UserSchema);
};

var PageQuery = async (page, pageSize, Model, populate, queryParams, sortParams) => {
    var start = (page - 1) * pageSize;
    var $page = {
        pageNumber: page
    };

    let count = await ModelCount(Model, queryParams);
    let records = await PageRecords(Model, queryParams, start, pageSize, populate, sortParams);

    $page.pageCount = (count - 1) / pageSize + 1;
    $page.results = records;

    return $page;
};

var ModelCount = (Model, queryParams) => {
    return new Promise((resolve, reject) => {
        Model.count(queryParams).exec(function (err, count) {
            if (err) {
                console.log("查询失败:" + err);
                reject(err);
            }
            else {
                resolve(count);
            }
        });
    });
}

var PageRecords = (Model, queryParams, start, pageSize, populate, sortParams) => {
    return new Promise((resolve, reject) => {
        Model.find(queryParams).skip(start).limit(pageSize).populate(populate).sort(sortParams).exec(function (err, doc) {
            if (err) {
                console.log("查询失败:" + err);
                reject(err);
            }
            else {
                resolve(doc);
            }
        });
    });
}

module.exports = (ModelName) => {
    return {
        Model: Model(ModelName),
        PageQuery: PageQuery
    }
};