/**
 * Created by lukas on 9.7.15.
 */

'use strict';

var can = require('can');

var RuleBase = can.Construct.extend({
    /**
     * @type {string|null}
     */
    message : null,

    /**
     * @type {string|null}
     */
    type: null,

    init : function(configuration) {
        this.message = configuration.value();
        this.type = configuration.attr('type');
    }
});

module.exports = RuleBase;