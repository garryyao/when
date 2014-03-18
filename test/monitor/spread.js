/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Garry Yao
 */

(function(define){
    'use strict';
    define(function(require){

        var when = require('../../when');

        when.resolve([123])
            .spread(function(x){
                return x + 1;
            }).then(function(x){
                throw new Error(x);
            });
    });
}(typeof define === 'function' && define.amd ? define : function(factory){ module.exports = factory(require); }));



