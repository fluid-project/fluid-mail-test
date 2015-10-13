// A simple file to launch an instance of the mail server for debugging and manual testing.
var fluid = fluid || require("infusion");
fluid.setLogging(true);

var gpii  = fluid.registerNamespace("gpii");

require("../index.js");

gpii.test.mail.smtp({
    port: 4425
});
