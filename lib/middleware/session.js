'use strict';
var _     = require('underscore');
var debug = require('debug')('kettil:webserver');
var tools = require('kettil-tools');

var cookie = function(options) {
    var session = require('cookie-session');

    if (_.isObject(options.cookie)) {
        _.extend(options, options.cookie);
    }

    return session(options);
};

var memory = function(options) {
    var session = require('express-session');

    return session(options);
};

var redis = function(options, namespace) {
    if (_.isUndefined(options.client)) {
        throw new Error('The instance of a connection to the Redis missing');
    }

    var session = require('express-session');
    var connect = require('connect-redis');
    var Store   = connect(session);

    return session(_.extend(options, {
        store: new Store(_.extend({
                prefix: (namespace + ':session:').replace(/^:/, '')
            }, options.redis || {}, {
                client: options.client
            })
        )
    }));
};

module.exports = function() {
    debug('Registration of the middleware session');

    if (this.get('session.encryptName') === true) {
        this.settings.session.name = tools.hash(
            this.get('namespace') + this.get('session.name')
        );
    }

    switch (this.get('session.mode')) {
        case 'redis':
            this.app.use(redis(this.get('session'), this.get('namespace')));
            break;
        case 'memory':
            this.app.use(memory(this.get('session')));
            break;
        case 'cookie':
            this.app.use(cookie(this.get('session')));
            break;
        default:
            throw new Error(
                'The session mode is incorrect (' + this.get('session.mode') + ' != [cookie,memory,redis]).'
            );
    }
};

