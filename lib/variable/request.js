'use strict';
var _     = require('underscore');
var debug = require('debug')('kettil:webserver');

var renderPiler = function(that, mode) {
    return that.piler[mode].renderTags.apply(
        that.piler[mode],
        that.get('piler.defaultRender.' + mode)
    );
};


module.exports = function() {
    debug('Registration of the global request variable');
    var that = this;

    this.app.use(function(req, res, next) {
        // requested url from the user
        res.locals._url = req.originalUrl;

        // csrf
        if (that.get('active.csrf')) {
            res.locals._csrf = req.csrfToken();
        }

        // language
        if (that.get('active.lingua') && res.lingua && _.isString(res.lingua.locale)) {
            res.locals._lang = res.lingua.locale.split('-').shift();
        } else {
            res.locals._lang = 'en';
        }

        // css/js
        if (that.get('active.piler')) {
            req.piler = that.piler;

            if (_.isArray(that.get('piler.defaultRender.css'))) {
                res.locals._css = renderPiler(that, 'css');
            }
            if (_.isArray(that.get('piler.defaultRender.js'))) {
                res.locals._js = renderPiler(that, 'js');
            }
        }

        next();
    });
};

