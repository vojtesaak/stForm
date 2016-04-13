/**
 * Created by lukas on 10.9.15.
 */
'use strict';

var RuleNumberBase = require('./ruleNumberBase');

var RuleNumber = RuleNumberBase.extend({

    resolve : function(value) {

        if(value === null || value === '') {
            return true;
        }

        value = this.parseNumber(value);

        return typeof value === 'number' && Number.isFinite(value);
    }

});

module.exports = RuleNumber;