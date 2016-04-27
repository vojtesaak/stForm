/**
 * Created by lukas on 11.6.15.
 */

'use strict';

var can = require('can');
var Field = require('./field');
var Select = require('../utils/select');

require('bootstrap-select-js');
//require('bootstrap-select-less/bootstrap-select.less!');
require('bootstrap-select-css/bootstrap-select.css!');
require('jquery.scrollto');

var visible = require('visible-element')($);

var FieldSelect = Field.extend({
    select: null,
    config: null,
    selectReady: null,
    filter: null,

    data: null,
    modelParams: null, // defaultValue: null, // NOTE KEEP THIS COMMENTED!
    notValidatedAfterInit: true,

    /**
     *
     * @param {object} config
     * @param {StFormConfig} formConfig
     */
    init: function (config, formConfig) {
        this._super(config, formConfig);
        var self = this;
        this.attr('config', config);
        this.attr('selectReady', new can.Deferred());

        this.bind('hiddenValue', function () {
            setTimeout(function () {
                self.initField();
            }, 100);
        });
    },

    /**
     *
     * @returns {string}
     */
    getFieldTemplate: function () {

        var template = '';
        //!steal-remove-start
        if (false) { // NOTE set true when need to debug select :)
            template += ' (value: {{config.entity.'
                        + this.name
                        + '}}, typeof: {{'
                        + this.getTemplateAttr('getTypeof')
                        + ' config.entity.'
                        + this.name
                        + '}})';
        }
        //!steal-remove-end

        template += '<select '
                    + 'class="form-control"'
                    + ' id="'
                    + this.id
                    + '" '
                    + this.actionAttributes
                    + '{{#if '
                    + this.getTemplateAttr('disabled')
                    + '}} disabled="disabled" {{/if}}'
                    + ' >';

        template += '</select>';

        return template;
    },

    initField: function () {
        var self = this;
        var $input = can.$('#' + this.id);
        if ($input.length > 0) {
            var compute = this.formConfig.compute('entity.' + this.name);

            compute.bind('change', function () {
                self.select.setValue(compute);
            });

            if (!this.select) {
                var select = new Select(this.config, {
                    filter: this.filter,
                    shownCallback: function () {
                        var $input = can.$('#' + self.id);
                        var scrollToLastItem = function () {
                            var $dropDownLast = $input.parent().find('.dropdown-menu.open ul li:last');
                            var $dropDown = $input.parent().find('.dropdown-menu.open');
                            var $dropDownMenu = $input.parent().find('.dropdown-menu.inner li');
                            var $container = $('st-form > .form-container');

                            if ($dropDownMenu.length > 0) {

                                var isDropdownOverflowed = self.selectDropdownIsOverflowed($dropDown, $container);

                                if (!visible.inViewport($dropDownLast) || isDropdownOverflowed) {
                                    var scrollBy = $dropDownMenu.length * $dropDownLast.height();
                                    $container.scrollTo('+=' + scrollBy + 'px', {
                                        axis: 'y',
                                        duration: 200
                                    });
                                }

                                return true;
                            } else {
                                return false;
                            }
                        };

                        if (!scrollToLastItem()) {
                            setTimeout(scrollToLastItem, 100);
                        }
                    }
                });
                this.attr('select', select);
            }

            this.select.setForElement($input);
            this.selectReady.resolve();
            this.selectReady.then(function () {
                self.resetOptions();
                self.select.setValue(compute);
            });
        }
    },

    /**
     *
     * @param {Promise|object|Model} data
     * @param {object} [modelParams]
     * @param {string} defaultValue
     */
    setOptions: function (data, modelParams, defaultValue) {
        this.data = data;
        this.modelParams = modelParams;
        if (typeof defaultValue !== 'undefined') {
            this.defaultValue = defaultValue;
        }
    },

    /**
     * @param {Function} filter
     */
    setFilter: function (filter) {
        this.filter = filter;
        if (this.select) {
            this.select.setFilter(filter);
        }
    },

    resetOptions: function () {
        this.select.setOptions(this.data, this.modelParams);
    },

    //!steal-remove-start
    /**
     * @only for debugging purposes
     * @param val
     * @returns {*}
     */
    getTypeof: function (val) {
        if ('function' === typeof val) {
            val = val();
        }

        if (val === null) {
            return 'native null';
        } else if (val === 'null') {
            return 'string null';
        } else {
            return typeof val;
        }
    },
    //!steal-remove-end

    /**
     *
     * @param {$} $dropDown     selectbox dropdown
     * @param {$} $container    parent scrolling container
     * @returns {boolean}
     */
    selectDropdownIsOverflowed: function($dropDown, $container) {
        return $dropDown.offset().top + $dropDown.outerHeight() > $container.offset().top + $container.outerHeight();
    }

});

module.exports = FieldSelect;
