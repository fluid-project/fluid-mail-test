// Caseholder for easy reuse in mail tests.
"use strict";

var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.test.mail.caseholder");

var jqUnit = require("jqUnit");
var fs     = require("fs");

gpii.test.mail.caseholder.verifyMessage = function (that, session, expected, messageFile) {

    jqUnit.assertEquals("The sender should be correct", expected.from, session.envelope.mailFrom.address);
    jqUnit.assertEquals("The recipient should be correct", expected.to, session.envelope.rcptTo[0].address);

    if (messageFile) {
        // Confirm that the test content exists and is correct
        var messageBody = fs.readFileSync(messageFile, "utf8");
        jqUnit.assertTrue("There should be a message ID", messageBody.indexOf("Message-Id") !== -1);
        jqUnit.assertTrue("The subject data should be in the message.", messageBody.indexOf(expected.subject) !== -1);
        jqUnit.assertTrue("The message text should be in the message.", messageBody.indexOf(expected.text) !== -1);
    }
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