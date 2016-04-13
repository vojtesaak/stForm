/**
 * Created by lukas on 22.6.15.
 */
'use strict';

var can = require('can');
var Validator = require('../validator/validator');

var Field = can.Map.extend({
    counter: 0
},{
    id: null,
    name: null,
    title: null,
    render: true,

    hidden: false,

    disabled: false,

    /**
     * @type {StFormConfig}
     */
    formConfig: null,

    inputValidator: null,

    /**
     * @type {Promise|null}
     */
    initialized: null,

    notValidatedAfterInit: false,

    error: null,

    // defaultValue: undefined, // note keep this as it is

    placeholder: null,

    hiddenValue: false,

    autofocus: false,

    _hidden: function () {
        var attrHidden = this.attr('hidden');
        var manuallyHidden = (typeof attrHidden === 'function') ? attrHidden() : attrHidden;
        var visibleForForm = this.attr('form');
        var actualDisplayedForm = this.attr('formConfig.visibleForm');
        var ret = manuallyHidden || (!!visibleForForm && visibleForForm !== actualDisplayedForm);

        this.attr('hiddenValue', !this.hiddenValue);

        return ret;
    },

    /**
     *
     * @param {object} config
     * @param {StFormConfig} [formConfig]
     */
    init: function(config, formConfig) {

        this.attr('formConfig', formConfig);
        this.attr('form', config.attr('form'));
        this.attr('name', config.attr('name'));
        this.attr('title', config.attr('title'));
        this.attr('disabled', !!config.attr('disabled'));
        this.attr('autofocus', config.hasAttr('autofocus'));
        this.attr('id', 'Field' + Field.counter++);
        this.placeholder = config.attr('placeholder');

        if (typeof config.attr('default') !== 'undefined') {
            this.attr('defaultValue', config.attr('default'));
        }

        if (typeof config.attr('placeholder') !== 'undefined') {
            this.attr('placeholder', config.attr('placeholder'));
        }

        if (config.rule) {
            var self = this;
            this.attr('inputValidator', new Validator(config.rule));
            this.formConfig.bind('entity.'+this.name, function(ev, newVal, oldVal) {
                if (typeof oldVal !== 'undefined' || self.notValidatedAfterInit) {
                    self.attr('error', self.inputValidator.validate(newVal, self.formConfig.entity));
                }
            });
        }

        var actionAttributes = ['keypress', 'keydown', 'keyup', 'click', 'change'].map(function (eventName) {
            var callbackName = config.attr('on' + eventName);
            return (callbackName ? 'can-' + eventName + '="callAction \'' + callbackName + '\' \'' + this.attr('id') + '\'"' : '');
        }, this).join(' ');

        this.attr('actionAttributes', actionAttributes);

    },

    getTemplate: function () {

        var html =  '{{#unless ' + this.getTemplateAttr('_hidden') + '}} ';
        html +=         '<div class="form-group' + this.hasErrorTemplate() + '">';
        html +=          this.getLabelTemplate() + this.getFieldTemplate() + this.getErrorTemplate();
        html +=         '</div>';
        html +=     '{{/unless}} ';

        return html;
    },

    /**
     *
     * @returns {string}
     */
    getTemplateAttr: function(attr) {
        return this.formConfig.getFieldsPath() + this.name + '.' + attr;
    },

    getLabelTemplate: function() {
        return '<label for="{{' + this.getTemplateAttr('id') + '}}">{{' + this.getTemplateAttr('title') +'}}</label>';
    },

    hasErrorTemplate: function() {
        return '{{#if ' + this.getTemplateAttr('error') +'}} has-error{{/if}}';
    },

    getErrorTemplate: function() {
        var error = this.getTemplateAttr('error');
        return '{{#if ' + error + '}}<span class="help-block">{{' + error + '}}</span>{{/if}}';
    },

    validateInput: function() {

        if (this.inputValidator) {
            this.attr('error', this.inputValidator.validate(this.formConfig.entity.attr(this.name), this.formConfig.entity ));
        }

        return this.error === null;
    },

    setDefaultValue : function() {

        var isValueMissing = this.formConfig.entity && typeof this.formConfig.entity.attr(this.name) === 'undefined';
        var isDefaultSpecified = typeof this.defaultValue !== 'undefined';

        if (isValueMissing && isDefaultSpecified) {
            var value = this.defaultValue;
            if (this.defaultValue === 'null') {
                value = null;
            }
            this.formConfig.entity.attr(this.name, value);
        }
    }
});

module.exports = Field;