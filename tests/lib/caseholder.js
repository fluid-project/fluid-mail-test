// Caseholder for easy reuse in mail tests.
"use strict";

var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.test.mail.caseholder");

var jqUnit = require("jqUnit");
var fs     = require("fs");

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

// Copied from a similar utility grade in `gpii.express`.
gpii.test.mail.caseholder.addRequiredSequences = function (sequenceStart, rawTests) {
    var completeTests = fluid.copy(rawTests);

    for (var a = 0; a < completeTests.length; a++) {
        var testSuite = completeTests[a];
        for (var b = 0; b < testSuite.tests.length; b++) {
            var tests = testSuite.tests[b];
            var modifiedSequence = sequenceStart.concat(tests.sequence);
            tests.sequence = modifiedSequence;
        }
    }

    return completeTests;
};

fluid.defaults("gpii.test.mail.caseholder", {
    gradeNames: ["fluid.test.testCaseHolder"],
    mergePolicy: {
        rawModules:    "noexpand",
        sequenceStart: "noexpand"
    },
    sequenceStart: [
        { // This sequence point is required because of a QUnit bug - it defers the start of sequence by 13ms "to avoid any current callbacks" in its words
            func: "{testEnvironment}.events.constructServer.fire"
        },
        {
            listener: "fluid.identity",
            event: "{testEnvironment}.events.onReady"
        }
    ],
    moduleSource: {
        funcName: "gpii.test.mail.caseholder.addRequiredSequences",
        args:     ["{that}.options.sequenceStart", "{that}.options.rawModules"]
    }
});