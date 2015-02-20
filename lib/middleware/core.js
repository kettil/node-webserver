'use strict';
var fs              = require('fs');
var _               = require('underscore');
var debug           = require('debug')('kettil:webserver');
var methodOverride  = require('method-override');
var favicon         = require('serve-favicon');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var compression     = require('compression');
var jade            = require('jade');

// Entfernt das Backslash ('/') am Ende der URL, wenn vorhanden
var removeBackslash = function() {
    return function(req, res, next) {
        var path   = req.path;
        var length = path.length - 1;
        if (length > 1 && req.method === 'GET' && path.charAt(length) === '/') {
            return res.redirect(301, req.originalUrl.replace(path, path.substr(0, length)));
        }
        next();
    };
};

var staticFiles = function(files, options) {
    return function(req, res, next) {
        if (req.method === 'GET' && _.has(files, req.path)) {
            var file = files[req.path];
            if (fs.existsSync(file)) {
                return res.sendFile(file, options);
            } else {
                var err = new Error('Not Found: ' + req.path);
                err.status = 404;
                return next(err);
            }
        }
        next();
    };
};


module.exports = function(express) {

    // checks whether the domain variable is defined
    if (!_.isString(this.get('domain')) || this.get('domain').length === 0) {
        // variable is not defined
        var viaHttp  = (this.get('port') === 80);
        var viaHttps = (this.get('port') === 443 && this.get('secure'));
        var port     = (viaHttp || viaHttps) ? '' : ':' + this.get('port');

        this.settings.domain = this.get('hostname') + port;
    }

    // x-powered-by Meldung
    if (_.isString(this.get('poweredBy')) && this.get('poweredBy').length > 0) {
        this.app.set('x-powered-by', this.get('poweredBy'));
    } else {
        this.app.disable('x-powered-by');
    }

    // Engine [app.engine()]
    this.app.engine('jade', jade.__express);

    // Variable [app.set()]
    this.app.set('views',        this.get('path.views'));
    this.app.set('view engine',  'jade');

    // Middleware [app.use()]
    debug('Registration of the middleware compression');
    this.app.use(compression());

    // favicon
    if (fs.existsSync(this.get('favicon'))) {
        debug('Registration of the middleware favicon');
        this.app.use(favicon(this.get('favicon')));
    }

    debug('Registration of the middleware removeBackslash');
    this.app.use(removeBackslash());


    if (_.size(this.get('staticFiles.files')) > 0) {
        debug('Registration of the middleware pageStaticFiles');
        this.app.use(staticFiles(
            this.get('staticFiles.files'),
            this.get('staticFiles.options')
        ));
    }

    debug('Registration of the middleware methodOverride');
    this.app.use(methodOverride());

    debug('Registration of the middleware bodyParser.json');
    this.app.use(bodyParser.json());

    debug('Registration of the middleware bodyParser.urlencoded');
    this.app.use(bodyParser.urlencoded({ extended: true }));

    debug('Registration of the middleware cookieParser');
    this.app.use(cookieParser());

    debug('Registration of the middleware static');
    this.app.use(express.static(this.get('path.public')));
};


