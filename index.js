'use strict';
var path    = require('path');
var http    = require('http');
var _       = require('underscore');
var debug   = require('debug')('kettil:webserver');
var tools   = require('kettil-tools');
var express = require('express');
// Special Page
var middlewarePageNotFound = require(path.join(__dirname, 'lib/page/notFound'));
var middlewarePageError    = require(path.join(__dirname, 'lib/page/error'));

var settings = {
    namespace:  '',
    title:      '',
    domain:     undefined,
    secure:     false, // if https or not
    hostname:   process.env.NODE_HOST || '127.0.0.1',
    port:       process.env.NODE_PORT || 8080,
    poweredBy:  undefined,
    active:     {
        morgan:   true,
        upload:   false,
        session:  false,
        csrf:     false,
        language: false,
        piler:    false
    },
    path: {
        assetsBower: tools.root('html/assets/bower'),
        assetsCss:   tools.root('html/assets/css'),
        assetsJs:    tools.root('html/assets/js'),
        assetsJsx:   tools.root('html/assets/jsx'),
        public:      tools.root('html/public'),
        views:       tools.root('html/views')
    },
    favicon:      tools.root('html/favicon.ico'),
    pageNotFound: '404', // jade file or middleware function
    pageError:    '500', // jade file or middleware function
    staticFiles:  {
        files:   {},
        options: {
            // settings for res.sendFile
            maxAge: 365 * 24 * 60 * 60 * 1000 // one Year
        }
    },
    morgan: {
        format:  'combined',
        options: {}
    },
    upload: {
        dest: tools.root('data/upload')
    },
    session: {
        mode:               'cookie',
        encryptName:        false,
        name:               'php-session',
        secret:             'VUP = Very Unimportant Person', // change this!
        saveUninitialized:  true,
        resave:             false,
        cookie: {
            httpOnly: true,
            maxAge:   null
        }
    },
    language: {
        default: 'de-DE',
        path:    tools.root('i18n')
    },
    piler: {
        publicFolder: {
            css: 'css',
            js:  'js'
        },
        defaultRender: {
            css: true, // bool or array with piler namespace
            js:  true  // bool or array with piler namespace
        },
        compilers: {
            jsx: false
        }
    }
};

var pathAssets = function(mode, file) {
    return path.join(this.get('path.' + mode), file);
};

var Webserver = function(options) {
    this.isActive = false;
    this.app      = express();
    this.server   = http.createServer(this.app);
    this.settings = tools.defaults(options || {}, settings);

    debug('ENV: %s', this.app.get('env'));

    // core function
    require(path.join(__dirname, 'lib/middleware/core')).call(this, express);

    // morgan - http logger
    if (this.get('active.morgan')) {
        require(path.join(__dirname, 'lib/middleware/morgan')).call(this);
    }
    // file upload
    if (this.get('active.upload')) {
        require(path.join(__dirname, 'lib/middleware/upload')).call(this);
    }
    // session
    if (this.get('active.session')) {
        require(path.join(__dirname, 'lib/middleware/session')).call(this);
    }
    // csrf
    if (this.get('active.csrf')) {
        require(path.join(__dirname, 'lib/middleware/csrf')).call(this);
    }
    // language
    if (this.get('active.language')) {
        require(path.join(__dirname, 'lib/middleware/language')).call(this);
    }
    // piler
    if (this.get('active.piler')) {
        require(path.join(__dirname, 'lib/middleware/piler')).call(this);
    }

    // system variable
    require(path.join(__dirname, 'lib/variable/system')).call(this);
    // request variable
    require(path.join(__dirname, 'lib/variable/request')).call(this);

};

_.extend(Webserver.prototype, {
    service: function(callback) {
        callback(this.app, this.server, express);
        return this;
    },
    middleware: function(middleware) {
        if (this.isActive) {
            throw new Error('It can not be added middlewares, after starting the web server');
        }
        this.app.use(middleware);
        return this;
    },
    cssManager: function(callback) {
        if (this.isActive) {
            throw new Error('It can not be added CSS-files after starting the web server');
        }
        if (!this.get('active.piler')) {
            throw new Error('Piler is not enabled');
        }
        callback(
            this.piler.css,
            pathAssets.bind(this, 'assetsCss'),
            pathAssets.bind(this, 'assetsBower')
        );
        return this;
    },
    jsManager: function(callback) {
        if (this.isActive) {
            throw new Error('It can not be added JS-files after starting the web server');
        }
        if (!this.get('active.piler')) {
            throw new Error('Piler is not enabled');
        }
        callback(
            this.piler.js,
            pathAssets.bind(this, 'assetsJs'),
            pathAssets.bind(this, 'assetsJsx'),
            pathAssets.bind(this, 'assetsBower')
        );
        return this;
    },
    routerManager: function(path, callback) {
        if (this.isActive) {
            throw new Error('It can not be added routes, after starting the web server');
        }
        // call without 'path'
        if (_.isFunction(path)) {
            callback = path;
            path     = '/';
        }
        // get an instance of router
        var router = express.Router();
        // Returns global middleware (for this route) that are called before the pages.
        var middleware = callback(router);

        if (!_.isArray(middleware)) {
            middleware = [];
        }
        this.app.use.apply(this.app, [_.isString(path) ? path : '/'].concat(middleware, router));

        return this;
    },
    start: function(done) {
        if (this.isActive) {
            throw new Error('webserver has already been started');
        }

        var pageNotFound = middlewarePageNotFound.call(this);
        var pageError    = middlewarePageError.call(this, pageNotFound);

        this.app.use(pageNotFound);
        this.app.use(pageError);

        // start webserver
        var that = this;
        this.server.listen(this.get('port'), this.get('hostname'), function() {
            debug('Express server listening on %s:%s', that.get('hostname'), that.get('port'));
            if (done) {
                done();
            }
        });
        // Web server is running
        this.isActive = true;

        return this;
    },
    stop: function(done) {
        if (!this.isActive) {
            throw new Error('webserver is not running');
        }
        var that = this;
        this.server.close(function() {
            // Webserver is not running
            that.isActive = false;

            if (done) {
                done();
            }
        });

        return this;
    },
    // return settings
    get: function(key) {
        return tools.get(this.settings, key);
    }

});

/**
 *
 * @param options
 * @returns {Webserver}
 */
var create = function(options) {
    return new Webserver(options);
};
// ################################################
module.exports = {
    create:    create,
    Webserver: Webserver
};