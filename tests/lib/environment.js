/*

  Test environment for reuse in mail tests, which:

  1. Provides the events used by the test case holder in the same directory.
  2. Launches an instance of the mail server when `constructServer` is fired.
  3. Configures the mail server to notify the environment when the mail server is read.

*/
"use strict";
var fluid        = require("infusion");

fluid.defaults("fluid.test.mail.environment", {
    gradeNames: ["fluid.test.testEnvironment"],
    port:       4025,
    events: {
        constructServer:   null,
        onError:           null,
        onReady:           null,
        onMessageReceived: null
    },
    components: {
        smtpServer: {
            createOnEvent: "constructServer",
            type: "fluid.test.mail.smtp",
            options: {
                port: "{testEnvironment}.options.port",
                listeners: {
                    onReady: {
                        func: "{testEnvironment}.events.onReady.fire"
                    },
                    onMessageReceived: {
                        func: "{testEnvironment}.events.onMessageReceived.fire"
                    },
                    onError: {
                        func: "{testEnvironment}.events.onError.fire"
                    }
                }
            }
        }
    }
});
