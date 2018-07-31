# Introduction

This package provides a test mail server based on [simplesmtp](https://github.com/andris9/simplesmtp), and a mail client
based on [`nodemailer-smtp-transport`](https://github.com/nodemailer/nodemailer-smtp-transport).

## Global Functions

### `gpii.mail.test.loadTestingSupport()`

* Returns: Nothing.

Require the files that define our case holder and environment (see below).  Allows third-parties to more easily reuse
our test fixtures.

## Components

### `gpii.test.mail.smtp`

A test mail server that allows you to examine the contents of outgoing mail messages from within
[Fluid IoC tests](http://docs.fluidproject.org/infusion/development/IoCTestingFramework.html).  This allows you to do
things like:

1. Confirm that a link send to a user via email is actually usable.
2. Confirm that mail message content is rendered correctly.

When a message is received, it is saved to the cache file, and then an `onMessageReceived` event is fired.  In your
tests you will typically:

1. Send mail.
2. Listen for the `onMessageReceived` event.
3. Examine the contents of `{gpii.test.mail.smtp}.currentMessageFile`.

Note that the filename for the cache file is generated using a timestamp, and is located in `os.tmpdir()` by default.

#### Component Options

| Option     | Type       | Description |
| ---------- | ---------- | ----------- |
| port       | `{Number}` | The port number to listen on.  Defaults to `4025`. |
| simpleSmtp | `{Object}` | The configuration options to pass on to `simplesmtp.createServer`.  See [the `simplesmtp` documentation](https://github.com/andris9/simplesmtp#advanced-smtp-server) for details. |

### `gpii.test.mail.mailer`

A wrapper around [`nodemailer-smtp-transport`](https://github.com/nodemailer/nodemailer-smtp-transport) that can be used
to send test messages to an arbitrary SMTP server.

#### Component Options

| Option             | Type        | Description |
| ------------------ | ----------- | ----------- |
| `transportOptions` | `{Object}`  | Configuration options to pass on to `nodemailer-smtp-transport`. See [their documentation](https://github.com/nodemailer/nodemailer-smtp-transport#usage) for details. |
| `smtpPort`         | `{Number}`  | The port on `transportOptions.host` we will attempt to connect to. |

#### Component Invokers

##### `{that}.sendMessage(mailOptions)`

* `mailOptions`: `{Object}` The mail options to pass on to `nodemailer-smtp-transport`.   The full syntax available can
  be found in [the nodemailer documentation](https:github.com/andris9/Nodemailer).  See below for an example.
* Returns: Nothing.

Send a message using `nodemailer-smtp-transport`. Fires `onSuccess` if the message is sent succesfully, or `onError` if
the message fails. Here is an example of typical `mailOptions`:

    {
      from:    "sender@site1.com",
      to:      "recipient@site2.com",
      cc:      "overseer@site3.com",
      subject: "Sample subject...",
      text:    "Text body of the message.\n",
      html:    "<p>HTML body of the message.</p>\n"
    }

Note that the `to` and `cc` elements can also be passed an array of email addresses.

### `gpii.test.mail.environment`

A `fluid.test.testEnvironment` that constructs an instance of `gpii.test.mail.smtp` when its `constructServer` event is
fired.  Intended for use with something like the `gpii.test.mail.caseholder` caseholder (see below).

#### Component Options

| Option | Type        | Description |
| ------ | ----------- | ----------- |
| `port` | `{Number}`  | The port the SMTP server should listen on. |

### `gpii.test.mail.caseholder`

An instance of `gpii.express.tests.caseHolder.base`, which is a case holder that allows wiring in default "first steps"
and "last steps" for each test.  This grade includes the "startup" sequences for `gpii.test.mail.environment`, which
launch the mail server, and then wait for it to finish starting up before continuing.  If you need different startup
steps, extend `gpii.express.tests.caseHolder.base` instead.

The only practical difference between this and a stock caseholder is that your tests should be stored in
`options.rawModules` rather than `options.modules`.
