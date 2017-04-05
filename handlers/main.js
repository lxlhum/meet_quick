exports.authorize_session_only_username = function (req, res, next) {

    {
        if (req.session.username) {
            return next();
        }
        else {
            res.render('login', { layout: "login", title: '米特学堂后台管理系统' });
        }
    }
};