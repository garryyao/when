/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Garry Yao
 */
(function(define){ 'use strict';
    define(function(){

        return function createAggregator(reporter){
            var nextKey;

            function PromiseStatus(){
                if (!(this instanceof PromiseStatus)) {
                    return new PromiseStatus();
                }

                var stackHolder;

                try {
                    throw new Error();
                } catch(e) {
                    stackHolder = e;
                }

                this.key = nextKey++;
                this.createdAt = stackHolder;
            }

            // Make a deep copy of this status chain.
            function clone(){
                var status = PromiseStatus();
                status.createdAt = this.createdAt;
                status.rejected = this.rejected;
                status.fulfilled = this.fulfilled;
                this.parent && (status.parent = clone.call(this.parent));
                return status;
            }

            PromiseStatus.prototype = {
                fulfilled: function(){
                },
                rejected: function(reason){
                    this.reason = reason;
                    reporter(this);
                },
                // TODO: fulfillment can be tracked in this function.
                // Resolve this status by the previous.
                resolved: function(status){

                    // avoid circle-references.
                    var curr = this;
                    while(curr) {
                        if (status === curr)
                            return;
                        curr = curr.parent;
                    }

                    curr = status;
                    while(curr) {
                        if (this === curr)
                            return;
                        curr = curr.parent;
                    }

                    this.parent = status;
                },
                // Create a new chain that rebase onto the other's head.
                rebase: function(newBase){
                    var head = clone.call(this), base = head;
                    while(base.parent)
                        base = base.parent;
                    base.resolved(newBase);
                    return head;
                }
            };

            reset();

            return publish({ publish: publish });

            function publish(target){
                target.PromiseStatus = PromiseStatus;
                return target;
            }

            function reset(){
                nextKey = 0;
            }
        };
    });
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
