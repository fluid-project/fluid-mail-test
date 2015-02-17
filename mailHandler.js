// The default mail handler, which simply fires an event when a message is received.
//
// Your tests should listen for the `messageReceived` event and then check anything that needs checking (see the tests for an example).
"use strict";
var fluid       = fluid || require("infusion");
var gpii        = fluid.registerNamespace("gpii");
var namespace   = "gpii.test.mail.smtp.mailHandler";
var mailHandler = fluid.registerNamespace(namespace);

mailHandler.handleMail = function (that, connection) {
    that.events.messageReceived.fire(connection);
};

fluid.defaults(namespace, {
    gradeNames: ["fluid.standardRelayComponent", "autoInit"],
    config:     "{gpii.test.mail.smtp}.config",
    model: {
        messageFile: "{gpii.test.mail.smtp}.messageFile"
    },
    events: {
        "messageReceived": null
    },
    invokers: {
        "handleMail": {
            funcName: namespace + ".handleMail",
            args: ["{that}", "{arguments}.0"]
        }
    }
});

