/**
 * Created by slanska on 2015-11-02.
 */
"use strict";
var crypto = require('crypto');
var captchapng = require('captchapng');
var webix;
(function (webix) {
    var extensions;
    (function (extensions) {
        var _hashSalt = crypto.randomBytes(128).toString('base64');
        /*
    
         */
        var Captcha = (function () {
            function Captcha() {
            }
            /*
    
             */
            Captcha.verify = function (originalHash, codeToVerify) {
                var hashToVerify = crypto.pbkdf2Sync(codeToVerify, _hashSalt, 4096, 128, 'sha256').toString('base64');
                return hashToVerify === originalHash;
            };
            /*
    
             */
            Captcha.init = function (app, path, debug) {
                if (path === void 0) { path = '/captcha'; }
                if (debug === void 0) { debug = false; }
                app.use(path, function (req, res, next) {
                    // Generate random value
                    var value = (Math.round(Math.random() * 9000 + 1000)).toString();
                    var hash = crypto.pbkdf2Sync(value, _hashSalt, 4096, 128, 'sha256').toString('base64');
                    var p = new captchapng(80, 30, value); // width,height,numeric captcha
                    p.color(0, 0, 0, 0); // First color: background (red, green, blue, alpha)
                    p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
                    var img = p.getBase64();
                    var imgbase64 = new Buffer(img, 'base64');
                    var result = {
                        hash: hash,
                        image: imgbase64
                    };
                    if (debug) {
                        result.value = value;
                    }
                    res.status(200).json(result);
                    res.end();
                });
            };
            return Captcha;
        }());
        extensions.Captcha = Captcha;
    })(extensions = webix.extensions || (webix.extensions = {}));
})(webix = exports.webix || (exports.webix = {}));
//# sourceMappingURL=captcha.js.map