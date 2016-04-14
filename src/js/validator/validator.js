/**
 * Created by lukas on 9.7.15.
 */

'use strict';

var can = require('can');
var RuleRequired = require('./ruleRequired');
var RuleEmail = require('./ruleEmail');
var RuleNumber = require('./ruleNumber');
var RuleMaxNumber = require('./ruleMaxNumber');
var RuleMinNumber = require('./ruleMinNumber');
var RuleNotNull = require('./ruleNotNull');
var RuleBusinessId = require('./ruleBusinessId');
var RuleIsEqual = require('./ruleIsEqual');
var RuleLength = require('./ruleLength');
var RuleMinLength = require('./ruleMinLength');
var RuleMaxLength = require('./ruleMaxLength');
var RuleVatId = require('./ruleVatId');


var Validator = can.Construct.extend({

},{

    /**
     * @type {[]|null}
     */
    rules : null,


    rulesCallbacks: null,


    init : function(rules) {

        this.rules = [];
        this.rulesCallbacks = {};

        if (!$.isArray(rules)) {
            rules = [rules];
        }
        for (var i = 0; i < rules.length; i++) {
            var rule = this.constructRule(rules[i]);
            if (rule) {
                this.rules.push(rule);
            }

        }

    },


    constructRule : function(configuration) {

        switch (configuration.attr('type')) {
            case 'Required':
                return new RuleRequired(configuration);
            case 'Email':
                return new RuleEmail(configuration);
            case 'BusinessId':
                return new RuleBusinessId(configuration);
            case 'Number':
                return new RuleNumber(configuration);
            case 'MaxNumber':
                return new RuleMaxNumber(configuration);
            case 'MinNumber':
                return new RuleMinNumber(configuration);
            case 'NotNull':
                return new RuleNotNull(configuration);
            case 'IsEqual':
                return new RuleIsEqual(configuration);
            case 'Length':
                return new RuleLength(configuration);
            case 'MinLength':
                return new RuleMinLength(configuration);
            case 'MaxLength':
                return new RuleMaxLength(configuration);
            case 'VatId':
                return new RuleVatId(configuration);
        }

        return null;
    },


    validate : function(value, entity) {

        for (var i = 0; i < this.rules.length; i++) {
            var rule =  this.rules[i];
            var type = this._capitalizeFirstLetter(rule.type);

            if( !this.rulesCallbacks[type] || this.rulesCallbacks[type](entity) ) {
                if (!rule.resolve(value, entity)) {
                    return rule.message;
                }
            }

        }


        return null;
    },


    _capitalizeFirstLetter: function(val) {
        return val.charAt(0).toUpperCase() + val.slice(1);
    },


    /**
     * @param {string} ruleType         type of the rule (ie. email, required etc ),
     *                                  you can add multiple rules separated by space
     *
     * @param {function} cb
     */
    setRuleCondition: function(ruleType, cb) {
        var type =  this._capitalizeFirstLetter(ruleType);
        this.rulesCallbacks[type] = cb;
    }


});

module.exports = Validator;