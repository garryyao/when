/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Garry Yao
 */
(function(define) { 'use strict';

	define(function(require) {

		var array = require('./array'),
			filter = require('./stackFilter');

		function ltrim(string) {
			return string.replace(/^\s*/, '');
		}

		return function simpleFormatter(promiseChainFilter, stackFilter) {

            var hasStackTraces;

            try {
                throw new Error();
            } catch (e) {
                hasStackTraces = !!e.stack;
            }

            var chainExcludes = promiseChainFilter["filter"] || [];
            var stackExcludes = stackFilter["filter"] || [];
            var chainReplacer = promiseChainFilter["replacer"] || '';
            var stackReplacer = stackFilter["replacer"] || '';


            var rejections_stack_header = '=== Rejected promise chain ===';
            var cause_stack_header = '=== Rejection cause stack ===';

            var rejectionsStackFilter = filter(chainExcludes, chainReplacer);
            var causeStackFilter = filter(stackExcludes, stackReplacer);

            // Format all promise rejections in a stack.
            function formatRejectionChain(rej){
                var promises = [], line;
                while(rej) {
                    line = formatRejection(rej);
                    if (line && line !== promises[0])
                        promises.unshift(line);
                    rej = rej.parent;
                }
                return promises;
            }

            // Filtering out stack lines from when internal, leaving only the line where the thenable is created.
            function formatRejection(rej){
                var stack = lines(rej.createdAt.stack).slice(1);
                stack = rejectionsStackFilter(stack);
                return stack.length ? stack[0] : '';
            }

            function stitch(rejectionCause, rejectionStack){
                return [rejections_stack_header]
                    .concat(rejectionStack)
                    .concat([cause_stack_header])
                    .concat(rejectionCause).join('\n');
            }

            function lines(stack){
                stack = stack ? stack.split('\n') : [];
                array.forEach(stack, function(line, i, stack){
                    stack[i] = ltrim(line);
                });
                return stack;
            }

            return function format(rec){
                var cause, formatted;

                formatted = {
                    reason: rec.reason,
                    message: rec.reason && rec.reason.toString()
                };

                if (hasStackTraces) {
                    cause = rec.reason && rec.reason.stack;
                    if (!cause) {
                        cause = rec.rejectedAt && rec.rejectedAt.stack;
                    }
                    var errorStack = causeStackFilter(lines(cause));
                    var promiseChain = formatRejectionChain(rec);
                    formatted.stack = errorStack.join('\n');
                    formatted.chain = promiseChain.join('\n');
                    formatted.assembly = stitch(errorStack, promiseChain);
                }

                return formatted;
            };
        }

	});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
