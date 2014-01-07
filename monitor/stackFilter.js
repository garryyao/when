/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */
(function(define){ 'use strict';
    define(function(require){

        var array = require('./array');

        function lineFilter(regexps){
            return function(line){
                var filtered = false;
                var tests = regexps.slice(0);
                while(tests.length) {
                    if (tests.pop().test(line)) {
                        filtered = true;
                        break;
                    }
                }
                return filtered;
            }
        }

        return function(excludePatterns, replacer){
            var filter = lineFilter(excludePatterns);
            return function filterStack(stack){
                var excluded;

                if (!(stack && stack.length)) {
                    return [];
                }

                excluded = [];

                return array.reduce(stack, [], function(filtered, line){
                    // Trim left whitespaces.
                    // line = line.trimLeft();
                    var match = filter(line);
                    if (!match) {
                        if (excluded && excluded.length && filtered.length) {
                            var substitution = typeof replacer == 'function' ? replacer(excluded) : replacer;
                            filtered = filtered.concat(substitution);
                            excluded = null;
                        }
                        filtered.push(line);
                    } else if (replacer) {
                        if (!excluded) {
                            excluded = [];
                        }
                        excluded.push(line);
                    }

                    return filtered;
                });
            };
        };
    });
}(typeof define === 'function' && define.amd ? define : function(factory){ module.exports = factory(require); }));
