/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

(function(define){ 'use strict';

    function error(){
        throw new Error('error');
    }

    define(function(require){
        var when = require('../../when');

        function first_value(){
            return arguments[0];
        }

        var promise = when.resolve(123).then(function(){
            return when.promise(function(resolve){
                resolve('foo');
            });
        });

        promise.then(function(){
            return when.all(['foo', 'bar'], first_value);
        }).then(function(){
                var df = when.defer();
                setTimeout(function(){
                    df.resolve(123);
                }, 500);
                return df.promise.then(function(x){
                    error();
                    return x;
                });
            }).yield(100);
    });

}(typeof define === 'function' && define.amd ? define : function(factory){ module.exports = factory(require); }));
