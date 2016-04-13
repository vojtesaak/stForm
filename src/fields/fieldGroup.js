/**
 * Created by lukas on 11.6.15.
 */

'use strict';
var can = require('can');
var HtmlParser = require('../utils/htmlParser');

var FieldGroup = can.Map.extend({

    fields: null,
    name: null,
    title: null,
    parent: null,
    hidden: false,
    render: true,

    _hidden: function () {

        var manuallyHidden = this.attr('hidden');
        var visibleForForm = this.attr('form');
        var actualDisplayedForm = this.attr('parent.visibleForm');

        return manuallyHidden || (!!visibleForForm && visibleForForm !== actualDisplayedForm);
    },

    /**
     * Initializes all fields in group
     * @param config
     * @param parent
     * @param FieldFactory
     */
    init: function(config, parent, FieldFactory) {
        this.attr('parent', parent);
        this.attr('form', config.attr('form'));
        this.attr('title', config.attr('title'));
        this.attr('name', config.attr('name'));
        this.attr('classes', config.attr('classes'));

        this.attr('fields', new can.Map());
        var fields = HtmlParser.makeArray(config.field);

        for (var i = 0; i < fields.length; i++) {
            var name = fields[i].attr('name');
            var field = FieldFactory.createField(fields[i], parent);
            field.attr('render', false);
            this.fields.attr(name, field);
            this.parent.fields.attr(name, field);
        }
    },

    /**
     * Returns group's template with all inputs
     * @returns {string}
     */
    getTemplate: function ()
    {

        var html = '';
        html += '{{#unless ' + this.getTemplateAttr('_hidden') + '}} ';
        html += '<fieldset class="fieldset ' + this._getClasses() + '">';

        if (this.title !== undefined && this.title.trim().length) {
            html += '<legend>' + this.title + '</legend>';
        }

        this.fields.each(function(field){
            html += field.getTemplate();
        });

        html += '</fieldset>';
        html += '{{/unless}} ';

        return html;
    },

    /**
     *
     * @returns {string}
     */
    getTemplateAttr: function (attr)
    {
        return this.parent.getStructuredFieldsPath() + this.name + '.' + attr;
    },

    _getClasses: function() {
        return this.classes || '';
    }
});

module.exports = FieldGroup;