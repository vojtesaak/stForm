
'use strict';

var RuleBase = require('./ruleBase');

var RuleVatId = RuleBase.extend({

    resolve : function(value) {

        if(value === '' || value === null) {
            return true;
        }

        var re = /^[a-z]{2}[0-9a-z]{1,43}$/i;
        return re.test(value);
    }
});

module.exports = RuleVatId;