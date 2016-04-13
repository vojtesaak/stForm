/**
 * Created by vojtechmalek on 27.1.16.
 */
'use strict';

var RuleBase = require('./ruleBase');

var RuleIsEqual = RuleBase.extend({

    equalToName : null,

    init: function(configuration) {
        this._super(configuration);
        this.equalToName = configuration.attr('name');
    },

    resolve : function(value, entity) {
        if ( entity ) {
            return value === entity[this.equalToName];
        }
    }
});

module.exports = RuleIsEqual;