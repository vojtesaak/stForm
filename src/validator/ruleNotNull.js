/**
 * Created by lukas on 15.10.15.
 */

'use strict';

var RuleBase = require('./ruleBase');

var RuleNotNull = RuleBase.extend({

    resolve : function(value) {
        if (typeof value === 'undefined') {
            value = null;
        }

        return value !== null;
    }
});

module.exports = RuleNotNull;