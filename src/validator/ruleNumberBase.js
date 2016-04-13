/**
 * Created by lukas on 10.9.15.
 */
'use strict';

var RuleBase = require('./ruleBase');
var parseFloatHuman = require('../utils/parseFloatHuman');

var RuleNumberBase = RuleBase.extend({

    /**
     * @param {string|null|undefined} value
     * @returns {number|null}
     */
    parseNumber: function (value) {

        if(typeof value === 'number') {
            return value;

        } else if(typeof value === 'string') {
            return parseFloatHuman(value);

        } else {
            return null;
        }
    }

});

module.exports = RuleNumberBase;