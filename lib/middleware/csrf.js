'use strict';
var debug = require('debug')('kettil:webserver');
var csrf  = require('csurf');

module.exports = function() {
    if (!this.get('active.session')) {
        throw new Error('CSRF requires session');
    }
    debug('Registration of the middleware csrf');
    this.app.use(csrf());
};
