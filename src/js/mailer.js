/*

  A test component for sending outgoing mail messages.  Adapted from the mail prototype with template handling
  that is part of `gpii-express-user`.

  Uses [nodemailer-smtp-transport](https://github.com/andris9/nodemailer-smtp-transport) at the moment.  All options
  supported by that package can be configured using the `options.transportOptions` setting.

 */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

var nodemailer    = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

fluid.registerNamespace("gpii.test.mail.mailer");

// Send a message using `nodemailer-smtp-transport`.  Here is a basic example of typical `mailOptions`:
//
// {
//   from:    "sender@site1.com",
//   to:      "recipient@site2.com",
//   cc:      "overseer@site3.com",
//   subject: "Sample subject...",
//   text:    "Text body of the message.\n",
//   html:    "<p>HTML body of the message.</p>\n"
// }
//
// Note that the `to` and `cc` elements can also be passed an array of email addresses.  The full syntax available for
// `mailOptions` can be found in [the nodemailer documentation](https://github.com/andris9/Nodemailer).
//
gpii.test.mail.mailer.sendMessage = function (that, mailOptions) {
    var transport = nodemailer.createTransport(smtpTransport(that.options.transportOptions));
    transport.sendMail(mailOptions, that.handleSendResult);
};

// When we know the results of sending the message, fire an appropriate event so that other components can take action.
// Fires an `onError` event if an error is received, and passes along the error message and stack.  If the message is
// sent successfully, an `onSuccess` event is fired and the `info` object is passed along.
//
gpii.test.mail.mailer.handleSendResult = function (that, err, info) {
    if (err) {
        that.events.onError.fire({ message: err.message, stack: err.stack});
    }
    else {
        that.events.onSuccess.fire(info);
    }
};

fluid.defaults("gpii.test.mail.mailer", {
    gradeNames: ["fluid.component"],
    smtpPort:   "25",
    transportOptions: {
        ignoreTLS: true,
        secure:    false,
        port:      "{that}.options.smtpPort"
    },
    events: {
        onError:   null,
        onSuccess: null
    },
    invokers: {
        sendMessage: {
            funcName: "gpii.test.mail.mailer.sendMessage",
            args:     ["{that}", "{arguments}.0"] // Options to pass to nodemailer's `sendMail` function.
        },
        handleSendResult: {
            funcName: "gpii.test.mail.mailer.handleSendResult",
            args:     ["{that}", "{arguments}.0", "{arguments}.1"] // err, info
        }
    },
    listeners: {
        "onError.log": {
            funcName: "fluid.log",
            args:     ["Message transport failed:", "{arguments}.0"]
        },
        "onSuccess.log": {
            funcName: "fluid.log",
            args:     ["Message transmitted:", "{arguments}.0"]
        }
    }
});
