/**
 * Created by lukas on 10.9.15.
 */

'use strict';

var RuleNumberBase = require('./ruleNumberBase');

var RuleMaxNumber = RuleNumberBase.extend({

    maxValue: null,

    init : function(configuration) {
        this._super(configuration);
        this.maxValue = this.parseNumber(configuration.attr('value'));
    },

    resolve : function(value) {

        if(value === '' || value === null) {
            return true;
        }

        value = this.parseNumber(value);
        return typeof value === 'number' && value <= this.maxValue;
    }
});

module.exports = RuleMaxNumber;