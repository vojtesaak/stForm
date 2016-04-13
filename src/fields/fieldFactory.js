/**
 * Created by lukas on 29.6.15.
 */

'use strict';

var FieldPassword = require('./fieldPassword');
var FieldText = require('./fieldText');
var FieldNumber = require('./fieldNumber');
var FieldSelect = require('./fieldSelect');
var FieldCheckbox = require('./fieldCheckbox');
var FieldColor = require('./fieldColor');
var FieldButton = require('./fieldButton');
var FieldGroup = require('./fieldGroup');
var FieldTextarea = require('./fieldTextarea');
var FieldDate= require('./fieldDate');

var fieldFactory = {

    /**
     *
     * @param config
     * @param {StFormConfig} formConfig
     * @returns {Field}
     */
    createField: function (config, formConfig) {
        var type = config.attr('type');
        switch (type) {
            case 'Text':
                return new FieldText(config, formConfig);
            case 'Number':
                return new FieldNumber(config, formConfig);
            case 'Password':
                return new FieldPassword(config, formConfig);
            case 'Select':
                return new FieldSelect(config, formConfig);
            case 'Checkbox':
                return new FieldCheckbox(config, formConfig);
            case 'Color':
                return new FieldColor(config, formConfig);
            case 'Button':
                return new FieldButton(config, formConfig);
            case 'Group':
                return new FieldGroup(config, formConfig, fieldFactory);
            case 'Textarea':
                return new FieldTextarea(config, formConfig);
            case 'Date':
            case 'Datetime':
                return new FieldDate(config, formConfig);
        }
        return new FieldText(config, formConfig);
    }
};

module.exports = fieldFactory;