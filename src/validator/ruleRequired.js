/**
 * Created by lukas on 9.7.15.
 */

'use strict';

var RuleBase = require('./ruleBase');

var RuleRequired = RuleBase.extend({

    resolve : function(value) {

        if (typeof value === 'undefined') {
            value = '';
        }

        return value !== '';
    }
});

module.exports = RuleRequired;