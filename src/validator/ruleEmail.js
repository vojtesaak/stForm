/**
 * Created by lukas on 13.7.15.
 */


'use strict';

var RuleBase = require('./ruleBase');

var RuleEmail = RuleBase.extend({

    resolve : function(value) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(value);
    }
});

module.exports = RuleEmail;