var mongoose = require('../db/db.js');
var Schema = mongoose.Schema;

var Model = (schema_json_name, doc_name) => {
    var userjson = require("../schema/" + schema_json_name + ".json");
    var UserSchema = new Schema(userjson);
    var doc_name = doc_name ? doc_name : schema_json_name;
    return mongoose.model(doc_name, UserSchema);
};
/**
 * 
 * @param {*} page 显示到了第几页
 * @param {*} pageSize 每页显示多少行数据
 * @param {*} Model 数据库操作model，如user、page等
 * @param {*} populate 数据的限制条件和别名
 * @param {*} queryParams 查询条件
 * @param {*} sortParams 排序条件
 */
var PageQuery = async (page, pageSize, Model, populate, queryParams, sortParams) => {
    var start = (page - 1) * pageSize;
    var $page = {
        pageNumber: page
    };

    let TotleRow = await ModelCount(Model, queryParams);
    let records = await PageRecords(Model, queryParams, start, pageSize, populate, sortParams);

    $page.TotleRow = TotleRow;//(count - 1) / pageSize + 1;
    $page.PageCount=parseInt(TotleRow/pageSize)+1;
    $page.results = records;
    return $page;
};

var ModelCount = (Model, queryParams) => {
    return Model.count(queryParams).exec().then((count) => {
        return count;
    }).catch((err) => {
        console.log("err:" + err);
        return err;
    });
}

var PageRecords = (Model, queryParams, start, pageSize, populate, sortParams) => {
    return Model
        .find(queryParams)
        .skip(start)
        .limit(pageSize)
        .populate(populate)
        .sort(sortParams)
        .exec()
        .then((doc) => {
            return doc;
        }).catch((err) => {
            console.log("err:" + err);
            return err;
        });
}

module.exports = (ModelName) => {
    return {
        Model: Model(ModelName),
        PageQuery: PageQuery
    }
};