# kettil-webserver

## Description

This module is a collection of modules to set up quickly and easily a complete web server.
It builds on [express4](http://expressjs.com/) and their middleware.

The following properties can be enabled through the options:
* [file upload](#file-upload)
* [session](#session)
* [csrf](#csrf)
* [multiple language](#multiple-language)
* [CSS/JS/JSX compiler](#css-js-jsx-compiler)


## Install

```
$ npm install kettil-webserver
```

## Usage

```
var webserver = require('kettil-webserver');

var server = webserver.create({
    // options
    title:    'Website title',
    hostname: example.org,      // default: '127.0.0.1'
    port:     80,               // default: 8080
    active: {
        session:  true,
        csrf:     true,
        piler:    true
    }
    // ...
}).cssManager(function(piler, pathCss, pathBower) {
    // Add the CSS files that are compressed (by piler)

    // add a file
    piler.addFile('path-to-css-file.css');
    
    // add a file with path helper for css
    piler.addFile(pathCss('core.styl')); 
    // => path-to-project/public/assets/css/core.styl
    
    // add a file with path helper for bowser files
    piler.addFile(pathBower('normalize-css/normalize.css')); 
    // => path-to-project/public/assets/bower/normalize-css/normalize.css
    
    // or other piler function
}).jsManager(function(piler, pathJs, pathJsx, pathBower) {
    // Add the JS/JSX files that are compressed (by piler)

    // add a file
    piler.addFile('path-to-js-file.js');
    
    // add a file with path helper for js
    piler.addFile(pathJs('core.js')); 
    // => path-to-project/public/assets/js/core.js
    
    // add a file with path helper for jsx
    piler.addFile(pathJsx('core.jsx')); 
    // => path-to-project/public/assets/jsx/core.jsx
    
    // add a file with path helper for bowser files
    piler.addFile(pathBower('jquery/dist/jquery.js')); 
    // => path-to-project/public/assets/bower/jquery/dist/jquery.js
    
    // or other piler function
}).routerManager('/', function(router) {
    // Adding routes, see Syntax in express4
    
    router.get('/', function(req, res) {
        res.render('index', { title: 'Express' });
    });
    
    /// ...
}).service(function(app, server, express) {
    // Direct access to the app, server or express variable
        
    // ...
}).start(); // enables the web server
```

### Template variables

* `_createUrl(url, params)`
  * Generates a URL
* `_createLink(url, params)`
  * As _createUrl, but with the domain (requires the options `domain`)
* `_title`
  * Title of the website (see options)
* `_domain`
  * Domain of the website (see options)
* `_secure`
  * Whether the page with SSL operates (see options)
* `_url`
  * URL of the call
* `_csrf`
  * CSRF string (see [csurf](https://www.npmjs.com/package/csurf))
  * Is only defined if the feature is enabled
* `_lang`
  * The user's language
  * Is only defined if the feature is enabled
* `_css`
  * automatic rendered CSS files
  * Is only defined if the feature is enabled
* `_js`
  * automatic rendered JS files
  * Is only defined if the feature is enabled


### File structure

Default file structure. Can be changed with `path.*`.

```
path-to-project/data/upload         // folders for upload
path-to-project/html                // all files for the browser
path-to-project/html/assets         // uncompressed/original files
path-to-project/html/assets/bower   // bower-files
path-to-project/html/assets/css     // uncompressed/original css-files
path-to-project/html/assets/js      // uncompressed/original js-files
path-to-project/html/assets/jsx     // uncompressed/original jsx-files
path-to-project/html/public         // root directory from the web server
path-to-project/html/public/css     // compressed css-files
path-to-project/html/public/fonts   // fonts
path-to-project/html/public/images  // images
path-to-project/html/public/js      // compressed js-files
path-to-project/html/views          // HTML-templates
path-to-project/i18n                // language files
```

## Options

* [namespace](#namespace)
* [title](#title)
* [domain](#domain)
* [secure](#secure)
* [hostname](#hostname)
* [port](#port)
* [poweredby](#poweredby)
* [active](#active)
* [path](#path)
* [favicon](#favicon)
* [pageNotFound and pageError](#pagenotfound-and-pageerror)
* [staticFiles](#staticfiles)
* [morgan](#morgan)
* [upload](#upload)
* [session](#session)
  * [Mode cookie](#mode-cookie-default)
  * [Mode memory](#mode-memory)
  * [Mode redis](#mode-redis)
* [language](#language)
* [piler](#piler)


### `namespace`

namespace for multiple webserver instances

**default:** `''`

### `title`

Heading of the website. 
Can be accessed in the template via the variable `_title`.

**default:** `''`

### `domain`

The domain of the page.
Can be accessed in the template via the variable `_domain`.
If the domain is not defined, then it is composed of the hostname and port.
The domain is required for the template function `_createLink`.

If the connection is through a proxy (eg nginx), the variable should be set to the external domain.

**default:** `undefined`

### `secure`

If the connection uses SSL.

**default:** `false`

### `hostname`

The hostname of the website can be accessed.

**default:** `process.env.NODE_HOST || '127.0.0.1'`

### `port`

The port of the website can be accessed.

**default:** `process.env.NODE_PORT || 8080`

### `poweredBy`

Enables the "X-Powered-By" HTTP header with the text.

**default:** `''`

### `active.*`

Activates the corresponding module.

**default:**
```
active: {
        morgan:   true,
        upload:   false,
        session:  false,
        csrf:     false,
        language: false,
        piler:    false
}
```

### `path.*`

Paths to the respective public, template and assets folder.


**default:**
```
path: {
    assetsBower: 'path-to-project/html/assets/bower',
    assetsCss:   'path-to-project/html/assets/css',
    assetsJs:    'path-to-project/html/assets/js',
    assetsJsx:   'path-to-project/html/assets/jsx',
    public:      'path-to-project/html/public',
    views:       'path-to-project/html/views'
}
```

### `favicon`

Path to the favicon. 
This is set only if the icon exists.

**default:** `'path-to-project/html/favicon.ico'`

### `pageNotFound` and `pageError`

The two variable treats the error and not found page.
There are two ways, one to specify the template file or to pass a middleware function.

**default:**
```
pageNotFound: '404', // path-to-project/html/views/404.jade 
pageError:    '500', // path-to-project/html/views/404.jade 
```

### `staticFiles.*`

You can specify files that are not in the public folder, but will still be accessible.

The files-object is constructed as follows: `{ path-in-the-browser: path-on-the-server }`

The options are one-to-one passed at [sendfile](http://expressjs.com/4x/api.html#res.sendFile).

**default:**
```
staticFiles:  {
    files:   {},
    options: {
        maxAge: 31536000000 // one year
    }
}
```

### `morgan.*`

Settings for HTTP request logger
The module [morgan](https://www.npmjs.com/package/morgan) is used.
The options are one-to-one passed at morgan.

**default:**
```
morgan: {
    format:  'combined',
    options: {}
}
```

### `upload.*`

Settings for the upload of files.
The module [multer](https://www.npmjs.com/package/multer) is used.
The options are one-to-one passed at multer.
With the option `active.upload`, the module can be activated.

**default:**
```
upload: {
    dest: 'path-to-project/data/upload'
}
```

### `session.*`

Settings for the use of the session.
There are different modes provided to store the data.
The value `session.secret` **must be changed** when the system is productive!
With the option `active.session`, the module can be activated.

If the value `session.encryptName` is true, then the cookie name is hashed

#### mode: cookie [default]

It the module [cookie-session](https://www.npmjs.com/package/cookie-session) is used for storing the data.
The data is encrypted stored in the browser.
The [cookie options](https://www.npmjs.com/package/cookie-session#cookie-options) can be set in `session.cookie`.

This module is set as default.


**default:**
```
session: {
    mode:        'cookie',
    encryptName: false,
    name:        'php-session',
    secret:      'VUP = Very Unimportant Person', // change this!
    cookie: {
        httpOnly: true,
        maxAge:   null
    }
}
```

#### mode: memory

It the module [express-session](https://www.npmjs.com/package/express-session) is used for storing the data.
The data is stored in memory as long as the application is running.

**default:**
```
session: {
    mode:               'memory',
    encryptName:        false,
    name:               'php-session',
    secret:             'VUP = Very Unimportant Person', // change this!
    saveUninitialized:  true,
    resave:             false,
    cookie: {
        httpOnly: true,
        maxAge:   null
    }
}
```

#### mode: redis

It is the modules [express-session](https://www.npmjs.com/package/express-session) and 
  [connect-redis](https://www.npmjs.com/package/connect-redis) used for storing the data.
The data is stored in the database redis.
By using Redis multiple instances of the application can access the same session data.

It is a connection to the database via redis.createClient() required.
It must be stored in the variable `session.client`

**default:**
```
session: {
    mode:               'redis',
    client:             undefined, // is required, via redis.createClient()
    encryptName:        false,
    name:               'php-session',
    secret:             'VUP = Very Unimportant Person', // change this!
    saveUninitialized:  true,
    resave:             false,
    cookie: {
        httpOnly: true,
        maxAge:   null
    }
}
```

### `language.*`

Settings for the multi-language website.
The module [lingua](https://www.npmjs.com/package/lingua) is used.
All options of lingua can be used.
With the option `active.language`, the module can be activated.

**default:**
```
language: {
    default: 'de-DE',
    path:    'path-to-project/i18n'
}
```

### `piler.*`

Settings for the asset manager.
The module [piler](https://www.npmjs.com/package/piler) is used.

* `publicFolder.*`: Location of the compressed files in the `path.public` folder. 
* `defaultRender.*`: Renders assets file automatically and can be accessed via the variable _css or _js in the template.
* `compilers.*`: It adds new compiler.

**default:**
```
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
```

## License
MIT
