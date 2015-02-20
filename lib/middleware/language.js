'use strict';
var _      = require('underscore');
var debug  = require('debug')('kettil:webserver');
var lingua = require('lingua');

module.exports = function() {
    debug('Registration of the middleware lingua (language)');
    this.app.use(lingua(
        this.app,
        _.defaults(
            this.get('language'),
            { defaultLocale: this.get('language.default') }
        )
    ));
};
