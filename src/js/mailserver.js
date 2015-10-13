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
fluid.registerNamespace("gpii.test.mail.smtp");

var os            = require("os");

fluid.defaults("gpii.test.mail.smtp", {
    gradeNames: ["fluid.component"],
    port: 4025,
    simpleSmtp: {
        SMTPBanner:           "Test Mail Server",
        queueID:              "TESTMAIL",
        logger:               false,
        disableDNSValidation: true,
        disabledCommands:     ["AUTH"],
        outputDir:            os.tmpdir(),
        port:                 "{that}.options.port"
    },
    components: {
        mailServer: {
            type: "gpii.test.mail.smtp.simpleSmtpServer",
            options: {
                listeners: {
                    onMessageReceived: {
                        func: "{gpii.test.mail.smtp}.events.onMessageReceived.fire"
                    },
                    onReady: {
                        func: "{gpii.test.mail.smtp}.events.onReady.fire"
                    },
                    onError: {
                        func: "{gpii.test.mail.smtp}.events.onError.fire"
                    }
                }
            }
        }
    },
    events: {
        onReady:           null,
        onError:           null,
        onMessageReceived: null
    },
    listeners: {
    }
});