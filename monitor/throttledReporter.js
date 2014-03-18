/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Garry Yao
 */
(function(define){ 'use strict';
    define(function(){
        var rejections = [];

        // Reduce sub stack.
        function substack(one, other){
            other = other.chain.join('');
            one = one.chain.join('');
            return one.indexOf(other) > -1 || other.indexOf(one) > -1;
        }

        return function throttleReporter(formatter, logger, interval){
            interval = interval || 500;

            var task;

            (function log(){
                var messages = [];
                while(rejections.length)
                    messages.push(rejections.shift());

                if (messages.length) {
                    logger(messages);
                }

                rejections = [];

                task = setTimeout(log, interval);
            })();

            return function(rej){
                // Re-format the rejection.
                rej = formatter(rej);
                // Ignore any empty chain.
                if (!rej.chain.length)
                    return;

                for (var i = 0; i < rejections.length; i++) {
                    if (substack(rejections[i], rej)) {
                        rejections.splice(i, 1, rej);
                        return;
                    }
                }
                rejections.push(rej);
            };
        };
    });
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
