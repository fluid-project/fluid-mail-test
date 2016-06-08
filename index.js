// Convenience file to require all components in one go.
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("./src/js/mailserver");
require("./src/js/simpleSmtpServer");
require("./src/js/mailer");

fluid.registerNamespace("gpii.mail.test");
gpii.mail.test.loadTestingSupport = function () {
    require("./tests/lib/caseholder");
    require("./tests/lib/environment");
};

fluid.module.register("gpii-mail-test", __dirname, require);
