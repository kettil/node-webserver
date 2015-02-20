'use strict';
var _     = require('underscore');
var debug = require('debug')('kettil:webserver');

module.exports = function() {
    debug('Registration of the middleware page notFound');
    var file = this.get('pageNotFound');

    if (_.isFunction(file)) {
        // individual "Not Found" page
        return file;
    }
    return function(req, res, next) {
        res.status(404);
        if (req.xhr) {
            return res.json({
                error: {
                    message: 'Not Found',
                    status: 404,
                    stack: [],
                    params: {}
                }
            });
        } else {
            return res.render(file, {
                url: req.originalUrl
            });
        }
        // bugfix for jshint
        next();
    };
};
