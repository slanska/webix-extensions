/**
 * Created by slanska on 2015-11-02.
 */
/// <reference path="../../DefinitelyTyped/node/node.d.ts"/>
/// <reference path="../../DefinitelyTyped/express/express.d.ts" />
var express = require('express');
var app = express();
var captchaModule = require('../lib/server/captcha');
var captcha = captchaModule.webix.extensions.Captcha;
app.use(express.static('examples'));
app.use(express.static('lib/public'));
app.use("/lib", express.static("./lib/public"));
captcha.init(app, '/captcha');
captcha.init(app, '/debug/captcha', true);
var server = app.listen(3010, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
//# sourceMappingURL=app.js.map