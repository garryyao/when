/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Garry Yao
 */

(function(define){ 'use strict';

    function error(){
        throw new Error('error');
    }

    define(function(require){
        var when = require('../../when');

        return when.promise(function(resolve){
            resolve(123);
        }).then(function(){
                return when.promise(function(resolve){
                    resolve(123);
                }).then(function(){
                        return when.resolve('foo').then(error);
                    });
            });

        return p.then(function(){
            return 'abc';
        });

    });

}(typeof define === 'function' && define.amd ? define : function(factory){ module.exports = factory(require); }));

