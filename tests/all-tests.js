// Tests for the `gpii-mail-test` server, which allows receiving and inspection of outgoing messages.
//
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.test.mail.tests.all");

fluid.setLogging(true);

require("../index.js");
require("./lib/caseholder");
require("./lib/environment");

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
                    name: "Testing the correct transmission of a mail message by the mailer...",
                    type: "test",
                    sequence: [
                        // Send message
                        {
                            func: "{mailer}.sendMessage",
                            args: ["{that}.options.messages.basic"]
                        },
                        // These checks must be executed in this order or the test harness will kill anything it
                        // thinks is no longer needed without waiting for it to finish its work.  This results in errors
                        // related to the mailer's "success" handler being called after it has been destroyed.
                        //
                        // TODO:  Review with Antranig
                        //
                        // listen for the mail server to process the message and check the message body
                        {
                            listener: "fluid.identity",
                            event: "{testEnvironment}.smtpServer.events.onMessageReceived"
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
                        // These checks must be executed in this order or the test harness will kill anything it
                        // thinks is no longer needed without waiting for it to finish its work.  This results in errors
                        // related to the mailer's "success" handler being called after it has been destroyed.
                        //
                        // TODO:  Review with Antranig
                        //
                        // listen for the mail server to process the message and check the message body
                        {
                            listener: "gpii.test.mail.caseholder.verifyMailBody",
                            event: "{testEnvironment}.smtpServer.events.onMessageReceived",
                            args: ["{testEnvironment}", "{that}.options.messages.basic"]
                        },
                        // listen for receipt and check validity of message info.
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

