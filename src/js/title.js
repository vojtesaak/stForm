/**
 * Created by lukas on 22.6.15.
 */

'use strict';

var can = require('can');

var Title = can.Map.extend({
    counter: 0
},{
    id: null,

    /**
     * @type {StFormConfig}
     */
    formConfig: null,

    /**
     * @type {string}
     */
    text: null,

    form: null,

    _hidden: function () {

        var visibleForForm = this.attr('form');
        var actualDisplayedForm = this.attr('formConfig.visibleForm');

        return !!visibleForForm && visibleForForm !== actualDisplayedForm;
    },

    /**
     *
     * @param {object} config
     * @param {StFormConfig} [formConfig]
     */
    init: function(config, formConfig) {
        this.attr('formConfig', formConfig);
        this.attr('form', config.attr('form'));
        this.attr('id', 'Title' + Title.counter++);
        this.attr('text', config.value);
    },

    getTemplate: function () {

        var html =  '{{#unless ' + this.getTemplateAttr('_hidden') + '}}';
        html +=         '<div class="form-title">';
        html +=         '{{' + this.getTemplateAttr('text') + '}}';
        html +=         '</div>';
        html +=     '{{/unless}} ';

        return html;
    },

    /**
     *
     * @returns {string}
     */
    getTemplateAttr: function(attr) {
        return this.formConfig.getTitlesPath() + this.id + '.' + attr;
    }
});

module.exports = Title;