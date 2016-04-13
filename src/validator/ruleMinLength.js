/**
 * Created by vojtechmalek on 28.1.16.
 */

'use strict';

var RuleBase = require('./ruleBase');

var RuleMinLength= RuleBase.extend({

    init: function(configuration) {
        this._super(configuration);
        this.minLength = parseInt(configuration.attr('minlength'), 10 );
    },

    resolve : function(value) {
        value = value.toString();
        return value.length >= this.minLength;
    }
});

module.exports = RuleMinLength;