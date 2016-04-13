/**
 * Created by vojtechmalek on 28.1.16.
 */

'use strict';

var RuleBase = require('./ruleBase');

var RuleLength= RuleBase.extend({

    init: function(configuration) {
        this._super(configuration);
        this.charLength = parseInt(configuration.attr('length'), 10);
    },

    resolve : function(value) {
        value = value.toString();
        return value.length === this.charLength;
    }
});

module.exports = RuleLength;