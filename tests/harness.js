// A simple test harness that passes through key events from underlying components.
//
// Your code should bind a listener to those events to execute your tests.
//
// See the tests for examples.
"use strict";
var fluid = fluid || require('infusion');
var gpii  = fluid.registerNamespace("gpii");

require("../src/js/mailserver");
require("../src/js/simpleSmtpServer");

var jqUnit = fluid.require("jqUnit");
var fs     = require("fs");

var harness = fluid.registerNamespace("gpii.test.mail.harness");
harness.onMailServerReady = function(that) {
    that.events.ready.fire(that);
};
harness.onMessageReceived = function(that, connection) {
    that.events.messageReceived.fire(that, connection);
};

fluid.defaults("gpii.test.mail.harness", {
    "gradeNames": [ "gpii.test.mail.smtp", "fluid.standardRelayComponent", "autoInit" ],
    "config": { "port": 4026 },
    "events": {
        "messageReceived": null,
        "ready":           null
    },
    "listeners": {
        "{gpii.test.mail.smtp}.mailServer.events.messageReceived": {
            "funcName": "gpii.test.mail.harness.onMessageReceived",
            "args": ["{that}", "{arguments}.0"]
        },
        "{gpii.test.mail.smtp}.mailServer.events.ready": {
            "funcName": "gpii.test.mail.harness.onMailServerReady",
            "args": ["{that}"]
        }
    }
});