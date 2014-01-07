# Promise monitoring and debugging

This dir contains experimental new promise monitoring and debugging utilities for when.js.

## What does it do?

It monitors promise state transitions and then takes action, such as logging to the console, when certain criteria are met,
such as when a promise has been rejected but has no `onRejected` handlers attached to it, and thus the rejection would have been silent.

Since promises are asynchronous and their execution may span multiple disjoint stacks, it is to stitch
together a more complete promise chain.  This synthesized trace includes the point at which a promise chain was created,
through all promises that preceding in the chain, to the one where the rejection occurs, util the last rejected promise.

## How does it looks like:

Below is a default rejection reports, reads as two sections:
 * First section is the promise chain where the rejected promise lives.
 * The second section is the error stack of the error or resolution point that originates the rejection.

```
=== Rejected promise chain ===
at http://localhost:8000/when/test/monitor/handled-promise.js:25:22
at http://localhost:8000/when/test/monitor/handled-promise.js:25:35
at http://localhost:8000/when/test/monitor/handled-promise.js:26:16
at http://localhost:8000/when/test/monitor/handled-promise.js:31:11
at http://localhost:8000/when/test/monitor/handled-promise.js:32:16
at http://localhost:8000/when/test/monitor/handled-promise.js:33:6
at http://localhost:8000/when/test/monitor/handled-promise.js:34:19
at http://localhost:8000/when/test/monitor/handled-promise.js:38:25
at http://localhost:8000/when/test/monitor/handled-promise.js:43:12
=== Rejection cause stack ===
Error: error
at error (http://localhost:8000/when/test/monitor/handled-promise.js:15:9)
at http://localhost:8000/when/test/monitor/handled-promise.js:39:6

```

## Using it

Using it is easy: Load `when/monitor/console` in your environment as early as possible.  That's it.
If you have no unhandled rejections, it will be silent, but when you do have them, it will report them to the console, complete with synthetic stack traces.

It works in modern browsers (AMD), and in Node and RingoJS (CommonJS).

### AMD

Load `when/monitor/console` early, such as using curl.js's `preloads`:

```js
curl.config({
	packages: [
		{ name: 'when', location: 'path/to/when', main: 'when' },
		// ... other packages
	],
	preloads: ['when/monitor/console']
});

curl(['my/app']);
```

### CommonJS

```js
require('when/monitor/console');
```

## Roll your own monitor

Your own monitor can be created by assembling from the following modules:

### Aggregator

Aggregator is yet the most critical module in the monitor system, which implements a PromiseStatus interface to integrate
with when.js to track promise creations and resolutions, whenever a promise is created or resolved internally in when,
status object is created for each of the promise, and get notified once the promise is resolved/rejected, an error stack
is is saved upon each creation and resolution to track for source code lines.

Upon promise rejection the aggregator will report the rejected promise on topic for monitoring purpose.

### Reporter
The reporter object is responsible for capturing all the reported rejection and make decisions on whether and how to report
the promise, generally it takes `formatter` and a `logger` as parameter for customizing the reporting.

ThrottledReport is a reporter implementation that does not report immediately, it instead checks periodically for rejected promises
during a while and considerably combining multiple redundant promises into a single one.

### Formatter

This module is where the rejection get transformed into a more readable formatted message with optionally some stack lines filtered.

You may want to future customizing the promise chain and error stack to reduce unwanted lines coming from one particular file or files.
This can be achieved by using filter options the `simpleformatter` module, e.g.

```
var formatter = simpleFormatter(
	{
		// List of regexp to check for unwanted promise lines.
		filter: [/when\.js|(module|node)\.js:\d|when\/, /require\.js/, /jquery(-.*?)\.js/]
		// To replace the excluded promise lines.
		replacer: function(excluded){ return '...' + excluded.length + '...' }
	},
	{
		// List of regexp to check for unwanted error stack lines.
		filter: [/\(native\)/],
		// To replace the excluded error stack lines.
		replacer: '...'
	}
);

```

### Logger

Eventually the formatted rejection will be piped to the logger for appending to the appropriate output devices, the default consoleGroup
logger will send it to the browser console in a grouped message.

