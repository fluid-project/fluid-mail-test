// Tests for the `gpii-mail-test` server, which allows receiving and inspection of outgoing messages.
//
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.test.mail.tests.all");

require("../index.js");
gpii.mail.test.loadTestingSupport();

fluid.defaults("gpii.test.mail.tests.all.caseholder", {
    gradeNames: ["gpii.test.mail.caseholder"],
    iterations: 100,
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
            name: "Mail server tests...",
            tests: [
                {
                    name: "Testing the correct transmission of a mail message by the mailer...",
                    type: "test",
                    sequence: [
                        // Send message
                        {
                            func: "{mailer}.sendMessage",
                            args: ["{that}.options.messages.basic"]
                        },
                        // listen for receipt and check validity of message info.
                        {
                            listener: "gpii.test.mail.caseholder.verifyMailInfo",
                            event: "{mailer}.events.onSuccess",
                            args: ["{mailer}", "{arguments}.0", "{that}.options.messages.basic", "{testEnvironment}.smtpServer.currentMessageFile"]
                        }
                    ]
                },
                {
                    name: "Testing the correct receipt of a mail message by the server...",
                    type: "test",
                    sequence: [
                        // Send message
                        {
                            func: "{mailer}.sendMessage",
                            args: ["{that}.options.messages.basic"]
                        },
                        // listen for the mail server to process the message and check the message body
                        {
                            listener: "gpii.test.mail.caseholder.verifyMailBody",
                            event: "{testEnvironment}.smtpServer.events.onMessageReceived",
                            args: ["{testEnvironment}", "{that}.options.messages.basic"]
                        },
                        // This dummy check must be here or the mailer will be destroyed before its handler has been
                        // allowed to do its job, which will result in a `fluid.fail` that breaks the test.
                        {
                            listener: "fluid.identity",
                            event: "{mailer}.events.onSuccess"
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
