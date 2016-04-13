/**
 * Created by vojtechmalek on 28.1.16.
 */

'use strict';

var RuleBase = require('./ruleBase');

var RuleMaxLength= RuleBase.extend({

    init: function(configuration) {
        this._super(configuration);
        this.maxLength = parseInt(configuration.attr('maxlength'), 10 );
    },

    resolve : function(value) {
        value = value.toString();
        return value.length <= this.maxLength;
    }
});

module.exports = RuleMaxLength;