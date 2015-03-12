// An SMTP server to be used in outgoing mail tests.  It is only intended for testing, in that:
//
// 1.  It does not require any authentication or authorization
// 2.  It accepts mail for all domains and recipients
// 3.  It does not actually transmit messages.
//
// You can plug in your own tests to be run on individual messages by replacing the mailHandler component with your own implementation.
//
// For specific examples, look at the tests in this project.
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.test.mail.smtp");

var nodemailer    = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var os            = require("os");

gpii.test.mail.smtp.init = function (that) {
    that.transporter   = nodemailer.createTransport(smtpTransport(that.options.transport));
};

fluid.defaults("gpii.test.mail.smtp", {
    gradeNames: ["fluid.standardRelayComponent", "autoInit"],
    "port": 4025,
    "simpleSmtp": {
        "SMTPBanner":           "Test Mail Server",
        "queueID":              "TESTMAIL",
        "disableDNSValidation": true,
        "outputDir":            os.tmpdir(),
        "port":                 "{that}.options.port"
    },
    "transport": {
        "ignoreTLS":            true,
        "secure":               false,
        "port":                 "{that}.options.port"
    },
    "components": {
        "mailServer": {
            "type": "gpii.test.mail.smtp.simpleSmtpServer"
        }
    },
    "events": {
        "ready":           null,
        "messageReceived": null
    },
    "listeners": {
        "onCreate": {
            "funcName": "gpii.test.mail.smtp.init",
            "args":     ["{that}"]
        },
        "{mailServer}.events.messageReceived": "{that}.events.messageReceived.fire",
        "{mailServer}.events.ready":           "{that}.events.ready.fire"
    }
});