/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Garry Yao
 */
(function(define){ 'use strict';
    define(function(require){

        var createAggregator = require('./aggregator'),
            throttleReporter = require('./throttledReporter'),
            simpleFormatter = require('./simpleFormatter'),
            logger = require('./logger/consoleGroup');

        var promiseFilters = [
            /when\.js|(module|node)\.js:\d|when\/monitor\//i,
            /\b(PromiseStatus|Promise)\b/
        ];

        var error_filters = [
            /(when|keys|aggregator|reporter)\.js/
        ];

        var formatter = simpleFormatter(
            {
                filter: promiseFilters
            },
            {
                filter: error_filters,
                replacer: '...'
            }
        );

        var aggregator = createAggregator(throttleReporter(formatter, logger, 500));

        if (typeof console !== 'undefined')
            aggregator.publish(console);

        return aggregator;
    });
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
