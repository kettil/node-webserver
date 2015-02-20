'use strict';
var path  = require('path');
var debug = require('debug')('kettil:webserver');
var piler = require('piler');


var getOptions = function(mode) {
    var root   = path.normalize('/' + this.get('piler.publicFolder.' + mode)) + '/';
    var folder = path.join(this.get('path.public'), this.get('piler.publicFolder.' + mode));

    return { urlRoot: root, outputDirectory: folder };
};

// add jsx compiler
var compilerJsx = function() {
    var reactTools = require('react-tools');

    require('piler/lib/compilers').jsx = {
        targetExt: 'js',
        render: function(filename, code, done) {
            try {
                return done(null, reactTools.transform(code));
            } catch (error) {
                return done(error, null);
            }
        }
    };
};

module.exports = function() {
    debug('Registration of the middleware piler');
    var css = piler.createCSSManager(getOptions('css'));
    var js  = piler.createCSSManager(getOptions('js'));

    if (this.get('piler.compilers.jsx') === true) {
        compilerJsx();
    }

    css.bind(this.app, this.server);
    js.bind(this.app, this.server);

    if (this.get('piler.defaultRender.css') === true) {
        this.settings.piler.defaultRender.css = [];
    }
    if (this.get('piler.defaultRender.js') === true) {
        this.settings.piler.defaultRender.js = [];
    }

    this.piler = { css: css, js: js };
};
