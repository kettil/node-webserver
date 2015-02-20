'use strict';
var _     = require('underscore');
var debug = require('debug')('kettil:webserver');

/**
 * create urls
 *
 * @param url
 * @param params
 * @returns {*}
 */
var createUrl = function(url, params) {
    _.each(params, function(v, k) {
        url = url.replace(':' + k, v);
    });
    return url;
};


/**
 * create links
 *
 * @param scheme
 * @param domain
 * @param url
 * @param params
 * @returns {*}
 */
var createLink = function(url, params) {
    var scheme = 'http' + (this.get('secure') ? 's' : '') + '://';
    var domain = this.get('domain');

    return scheme + domain + createUrl(url, params);
};


module.exports = function() {
    debug('Registration of the global system variable');

    this.app.locals._createUrl  = createUrl;
    this.app.locals._createLink = createLink.bind(this);

    this.app.locals._title   = this.get('title');
    this.app.locals._domain  = this.get('domain');
    this.app.locals._secure  = this.get('secure');

    this.app.locals.error = {};
    this.app.locals.data  = {};
};
