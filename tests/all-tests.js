// Tests for the `gpii-mail-test` server, which allows receiving and inspection of outgoing messages.
//
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.test.mail.tests.all");

fluid.setLogging(true);

var jqUnit = require("jqUnit");

require("../index.js");
require("./lib/caseholder");
require("./lib/environment");

gpii.test.mail.tests.all.verifyError = function (error) {
    jqUnit.assertNotNull("There should be an error...", error);
};

fluid.defaults("gpii.test.mail.tests.all.caseholder", {
    gradeNames: ["gpii.test.mail.caseholder"],
    messages: {
        basic: {
            from:    "sender@localhost",
            to:      "recipient@localhost",
            subject: "Test Subject",
            text:    "Test Body"
        }
    },
    rawModules: [
        {
            tests: [
                {
                    name: "Testing sending and receiving of a sample message...",
                    type: "test",
                    sequence: [
                        // Send message
                        {
                            func: "{mailer}.sendMessage",
                            args: ["{that}.options.messages.basic"]
                        },
                        // listen for receipt and check validity of message.
                        {
                            listener: "gpii.test.mail.caseholder.verifyMessage",
                            event: "{testEnvironment}.events.onMessageReceived",
                            args: ["{arguments}.0", "{arguments}.1", "{that}.options.messages.basic", "{testEnvironment}.smtpServer.currentMessageFile"]
                        }
                    ]
                }
            ]
        }
    ],
    components: {
        mailer: {
            type: "gpii.test.mail.mailer",
            options: {
                smtpPort: "{testEnvironment}.options.port"
            }
        }
    }
});

gpii.test.mail.environment({
    port: 4425,
    components: {
        testCaseHolder: {
            type: "gpii.test.mail.tests.all.caseholder"
        }
    }
});

