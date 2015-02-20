'use strict';
var fs     = require('fs');
var debug  = require('debug')('kettil:webserver');
var multer = require('multer');


module.exports = function() {
    if (!fs.existsSync(this.get('multer.dest'))) {
        throw new Error('The upload folder "' + this.get('upload.dest') + '" does not exist (options.upload.dest)');
    }
    debug('Registration of the middleware multer (upload');
    this.app.use(multer(this.get('multer')));
};
