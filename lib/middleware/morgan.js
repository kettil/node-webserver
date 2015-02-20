'use strict';
var debug  = require('debug')('kettil:webserver');
var morgan = require('morgan');

module.exports = function() {
    debug('Registration of the middleware morgan');
    var format  = this.get('morgan.format');
    var options = this.get('morgan.options');

    this.app.use(morgan(format, options));
};
