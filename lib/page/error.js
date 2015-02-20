'use strict';
var _     = require('underscore');
var debug = require('debug')('kettil:webserver');

module.exports = function(pageNotFound) {
    debug('Registration of the middleware page error');
    var file  = this.get('pageError');
    var isDev = this.app.get('env') === 'development';

    if (_.isFunction(file)) {
        // individual error handler
        return file;
    }

    return function(err, req, res, next) {
        var status = err.status || 500;
        if (status === 404) {
            try {
                return pageNotFound(req, res);
            } catch (e) {
                err    = e;
                status = 500;
            }
        }

        var params = {
            message: err.message,
            status: status,
            stack: [],
            params: {}
        };

        if (isDev) {
            params = {
                message: err.message,
                status: status,
                stack: (err.stack || '').split('\n'),
                params: {
                    url: req.params,
                    get: req.query,
                    post: req.body,
                    cookie: req.cookies
                }
            };
        }

        if (req.xhr) {
            return res.status(status).json({error: params});
        } else {
            return res.status(status).render(file, params);
        }
        // bugfix for jshint
        next();
    };
};
