// Convenience file to require all components in one go.
"use strict";
var fluid = require("infusion");

require("./src/js/mailserver");
require("./src/js/simpleSmtpServer");
require("./src/js/mailer");

fluid.registerNamespace("fluid.mail.test");
fluid.mail.test.loadTestingSupport = function () {
    require("./tests/lib/caseholder");
    require("./tests/lib/environment");
};

fluid.module.register("fluid-mail-test", __dirname, require);
