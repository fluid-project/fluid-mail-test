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

fluid.registerNamespace("gpii.test.mail.caseholder");
gpii.test.mail.caseholder.generateTestTaggingFunction = function (index) {
    return function (rawTestSpec) {
        var taggedTestSpec = fluid.copy(rawTestSpec);
        if (taggedTestSpec.tests) {
            taggedTestSpec.tests = taggedTestSpec.tests.map(gpii.test.mail.caseholder.generateTestSequenceTaggingFunction(index));
        }
        return taggedTestSpec;
    };
};

gpii.test.mail.caseholder.generateTestSequenceTaggingFunction = function (index) {
    return function (rawTestSequence) {
        var taggedTestSequence = fluid.copy(rawTestSequence);
        if (taggedTestSequence.name) {
            taggedTestSequence.name += " (iteration #" + index + ")";
        }
        return taggedTestSequence;
    };
};

/*

    Take our tests and make sure that:

    1. They each have our "start" and "end" sequences appended.
    2. They are run options.iterations times.
    3. Each iteration is tagged with the iteration number, so that we can tell where we are in the overall pass.

 */
gpii.test.mail.caseholder.cloneTestSequences = function (that) {
    var generatedTests = [];
    for (var a = 1; a < that.options.iterations + 1; a++) {
        var rawIterationTests = gpii.express.tests.helpers.addRequiredSequences(that.options.rawModules, that.options.sequenceStart, that.options.sequenceEnd);
        var taggedIterationTests = rawIterationTests.map(gpii.test.mail.caseholder.generateTestTaggingFunction(a));
        generatedTests = generatedTests.concat(taggedIterationTests);
    }
    return generatedTests;
};

fluid.defaults("gpii.test.mail.caseholder", {
    gradeNames: ["gpii.express.tests.caseHolder.base"],
    iterations : 1,
    sequenceStart: [
        {
            func: "{testEnvironment}.events.constructServer.fire"
        },
        {
            listener: "fluid.identity",
            event: "{testEnvironment}.events.onReady"
        }
    ],
    moduleSource: {
        funcName: "gpii.test.mail.caseholder.cloneTestSequences",
        args:     ["{that}", "{that}.options.rawModules"]
    }
});