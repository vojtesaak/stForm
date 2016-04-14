/**
 * Created by lukas on 13.7.15.
 */


'use strict';

var RuleBase = require('./ruleBase');

var RuleBusinessId = RuleBase.extend({

    resolve : function(value) {

        if(value === '' || value === null) {
            return true;
        }

        var re = /^[a-z0-9]+$/i;
        return re.test(value);
    }
});

module.exports = RuleBusinessId;