// Caseholder for easy reuse in mail tests.
"use strict";

var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.test.mail.caseholder");

var jqUnit = require("node-jqunit");
var fs     = require("fs");

// We use the "sequence wiring" infrastructure from `gpii-express`.
require("gpii-express");
gpii.express.loadTestingSupport();

gpii.test.mail.caseholder.verifyMailInfo = function (that, info, expected) {
    jqUnit.assertTrue("The message should have been accepted...", info.accepted.length > 0);
    jqUnit.assertFalse("The message should not been rejected...", info.rejected.length > 0);

    jqUnit.assertTrue("There should be a message ID...", info.messageId);

    jqUnit.assertEquals("The sender should be correct", expected.from, info.envelope.from);
    jqUnit.assertEquals("The recipient should be correct", expected.to, info.envelope.to[0]);
};

gpii.test.mail.caseholder.verifyMailBody = function (testEnvironment, expected) {
    var messageFile = testEnvironment.smtpServer.mailServer.currentMessageFile;
    var messageBody = fs.readFileSync(messageFile, "utf8");

    var testFields = ["subject", "html", "text"];
    fluid.each(testFields, function (field) {
        var expectedValue = expected[field];
        if (expectedValue) {
            jqUnit.assertTrue("The message should contain data that matches the expected '" + field + "' field...", messageBody.indexOf(expectedValue) !== -1);
        }
    });
};

fluid.defaults("gpii.test.mail.caseholder", {
    gradeNames: ["gpii.express.tests.caseHolder.base"],
    // Although our initial sequences are currently the same as those used in the `gpii.express` test fixtures, we have
    // our own copy to avoid unexpected side effects as `gpii-express` changes.
    sequenceStart: [
        {
            func: "{testEnvironment}.events.constructServer.fire"
        },
        {
            listener: "fluid.identity",
            event: "{testEnvironment}.events.onReady"
        }
    ]
});