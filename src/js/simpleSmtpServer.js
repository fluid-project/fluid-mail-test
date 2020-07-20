// A module to wire in simplesmtp to handle incoming messages.
"use strict";
var fluid = require("infusion");
fluid.registerNamespace("fluid.test.mail.smtp.simpleSmtpServer");

var simplesmtp = require("simplesmtp");

var fs         = require("fs");

fluid.test.mail.smtp.simpleSmtpServer.handleStartData = function (that, connection) {
    var timestamp = (new Date()).getTime();
    that.currentMessageFile = that.options.config.outputDir + "/message-" + timestamp + ".txt";
    connection.saveStream = fs.createWriteStream(that.currentMessageFile);
};

fluid.test.mail.smtp.simpleSmtpServer.handleData = function (that, connection, chunk) {
    connection.saveStream.write(chunk);
};

fluid.test.mail.smtp.simpleSmtpServer.handleDataReady = function (that, connection, callback) {
    connection.saveStream.end(function () {
        that.events.onMessageReceived.fire(that, connection);

        callback(null, that.options.config.queueId);
    });
};

fluid.test.mail.smtp.simpleSmtpServer.init = function (that) {
    // Give simpleSMTP its own copy of our options to avoid issues with attempting to modify our options.
    var serverOptions = fluid.copy(that.options.config);
    that.simplesmtp = simplesmtp.createServer(serverOptions);

    that.simplesmtp.on("startData", that.handleStartData);
    that.simplesmtp.on("data",      that.handleData);
    that.simplesmtp.on("dataReady", that.handleDataReady);

    fluid.log("Starting test mail server on port " + that.options.config.port + "....");
    that.simplesmtp.listen(that.options.config.port, function () {
        that.events.onReady.fire(that);
    });
};

fluid.test.mail.smtp.simpleSmtpServer.stop = function (that) {
    try {
        that.simplesmtp.end(function () {
            fluid.log("Stopped mail server...");
        });
    }
    catch (e) {
        fluid.log("An error occurred while trying to stop the mail server:", e);
    }
};


fluid.defaults("fluid.test.mail.smtp.simpleSmtpServer", {
    gradeNames: ["fluid.modelComponent"],
    "config": "{fluid.test.mail.smtp}.options.simpleSmtp",
    "members": {
        "currentMessageFile": null
    },
    "invokers": {
        "handleStartData": {
            "funcName": "fluid.test.mail.smtp.simpleSmtpServer.handleStartData",
            "args": ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        },
        "handleData": {
            "funcName": "fluid.test.mail.smtp.simpleSmtpServer.handleData",
            "args": ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        },
        "handleDataReady": {
            "funcName": "fluid.test.mail.smtp.simpleSmtpServer.handleDataReady",
            "args": ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        }
    },
    "events": {
        "onMessageReceived": null,
        "onReady":           null,
        "onError":           null
    },
    "listeners": {
        "onCreate.init": {
            "funcName": "fluid.test.mail.smtp.simpleSmtpServer.init",
            "args": ["{that}"]
        },
        "onDestroy.stop": {
            "funcName": "fluid.test.mail.smtp.simpleSmtpServer.stop",
            "args": ["{that}"]
        },
        "onReady.log": {
            "funcName": "fluid.log",
            args: ["Mail server ready..."]
        }
    }
});
