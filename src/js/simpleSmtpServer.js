// A module to wire in simplesmtp to handle incoming messages.
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.test.mail.smtp.simpleSmtpServer");

var SMTPServer = require("smtp-server").SMTPServer;

var fs         = require("fs");

gpii.test.mail.smtp.simpleSmtpServer.handleData = function (that, stream, session, callback) {
    var timestamp = (new Date()).getTime();
    that.currentMessageFile = that.options.config.outputDir + "/message-" + timestamp + ".txt";

    var messageFileStream = fs.createWriteStream(that.currentMessageFile);
    stream.pipe(messageFileStream);

    stream.on("end", function () {
        that.events.onMessageReceived.fire(that, session);
        if (callback) {
            callback();
        }
    });
};

gpii.test.mail.smtp.simpleSmtpServer.handleError = function (that, error) {
    that.events.onError.fire(that, error);
};

// Accept mail for any recipient if `options.allowAllRecipients` is truthy.
gpii.test.mail.smtp.simpleSmtpServer.allowAllRecipients = function (that, address, session, done) {
    done();
};

gpii.test.mail.smtp.simpleSmtpServer.init = function (that) {
    var serverOptions = fluid.copy(that.options.config);
    serverOptions.onData = that.handleData;
    if (that.options.allowAllRecipients) {
        serverOptions.onRcptTo = that.allowAllRecipients;
    }

    that.simplesmtp = new SMTPServer(serverOptions);
    that.simplesmtp.on("error", that.handleError);

    fluid.log("Starting test mail server on port " + that.options.config.port + "....");
    that.simplesmtp.listen(that.options.config.port, function () {
        that.events.onReady.fire(that);
    });
};

gpii.test.mail.smtp.simpleSmtpServer.stop = function (that) {
    try {
        that.simplesmtp.end(function () {
            fluid.log("Stopped mail server...");
        });
    }
    catch (e) {
        fluid.log("The SMTP server thinks it was already stopped.  I don't care as long as it's no longer running.");
    }
};

fluid.defaults("gpii.test.mail.smtp.simpleSmtpServer", {
    gradeNames: ["fluid.modelComponent"],
    "config": "{gpii.test.mail.smtp}.options.simpleSmtp",
    allowAllRecipients: true,
    "members": {
        "currentMessageFile": null
    },
    "invokers": {
        "allowAllRecipients": {
            "funcName": "gpii.test.mail.smtp.simpleSmtpServer.allowAllRecipients",
            "args": ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        },
        "handleData": {
            "funcName": "gpii.test.mail.smtp.simpleSmtpServer.handleData",
            "args": ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        },
        "handleError": {
            "funcName": "gpii.test.mail.smtp.simpleSmtpServer.handleError",
            "args": ["{that}", "{arguments}.0"]
        }
    },
    "events": {
        "onMessageReceived": null,
        "onReady":           null,
        "onError":           null
    },
    "listeners": {
        "onCreate.init": {
            "funcName": "gpii.test.mail.smtp.simpleSmtpServer.init",
            "args": ["{that}"]
        },
        "onDestroy.stop": {
            "funcName": "gpii.test.mail.smtp.simpleSmtpServer.stop",
            "args": ["{that}"]
        },
        "onReady.log": {
            "funcName": "fluid.log",
            args: ["Mail server ready..."]
        }
    }
});