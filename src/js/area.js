/**
 * Created by Václav Oborník on 4. 9. 2015.
 */

'use strict';

var can = require('can');

var Area = can.Map.extend({
    counter: 0
}, {

    id: null,

    /**
     * @type {{ viewModel: string }}
     */
    areaConfig: null,

    /**
     * @type {StFormConfig}
     */
    formConfig: null,

    /**
     * @type {can.Map}
     */
    viewModel: null,

    isHiddenWatched: null,

    templatePath: null,


    _hidden: function () {

        var manuallyHidden = this.attr('hidden');
        var visibleForForm = this.attr('form');
        var actualDisplayedForm = this.attr('formConfig.visibleForm');
        var ret = manuallyHidden || (!!visibleForForm && visibleForForm !== actualDisplayedForm);

        this.attr('hiddenValue', !this.hiddenValue);

        return ret;
    },

    /**
     * @returns {can.Compute}
     */
    getHiddenCompute: function() {
        return this.compute('_hidden');
    },

    /**
     * @param {{ viewModel: string }} areaConfig
     * @param {StFormConfig} [formConfig]
     */
    init: function (areaConfig, formConfig) {
        this.attr('id', 'Area' + Area.counter++);
        this.attr('form', areaConfig.attr('form'));
        this.attr('name', areaConfig.attr('name'));
        this.attr('templatePath', areaConfig.attr('template'));
        this.attr('areaConfig', areaConfig);
        this.attr('formConfig', formConfig);
        this.attr('viewModel', formConfig.areaModels[this.name] || new can.Map());
    },

    /**
     *
     * @returns {string}
     */
    getTemplateAttr: function(attr) {
        return this.formConfig.getAreasPath() + this.name + '.' + attr;
    },

    getInnerFragment: function (helpers) {

        var templatePath = this.attr('templatePath');
        var viewModel = this.attr('viewModel');

        var template = can.view({
            url: templatePath,
            engine: 'stache'
        });

        if (typeof template === 'undefined') {
            window.reloadAlert(2);
            return can.view(can.view.stache('templateNotFound', 'Template not loaded'))();
        } else {
            return template(viewModel, helpers);
        }

       // return templates.get(templatePath)(viewModel, helpers);
    },

    /**
     * @returns {string}
     */
    getTemplate: function () {
        return '<div id="' + this.attr('id') + '" class="area"></div>';
    }


});


module.exports = Area;