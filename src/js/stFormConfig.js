/**
 * Created by lukas on 22.5.15.
 */


'use strict';

var can = require('can');
var HtmlParser = require('./utils/htmlParser');
var FieldFactory = require('./fields/fieldFactory');
var FieldGroup = require('./fields/fieldGroup');
var Area = require('./area');
var Title = require('./title');
var StFormAction = require('./stFormAction');

//require('./stForm');

var StFormConfig = can.Map.extend({
    // static

},{

    /**
     * @type {can.Map}
     */
    structuredFields: null,

    areas: null,
    areaModels: null,

    /**
     *
     * A flat structure
     * @type {can.Map}
     */
    fields: null,

    namedGroups: null,

    actions: null,

    submitCallback: null,

    entity: null,

    visibleForm: null,

    _configProcessed: false,

    _onConfigProcessed: null,

    titles: null,

    loading: false,


    /**
     * @param {Function} [onConfigProcessed]
     */
    init : function (onConfigProcessed) {

        this.attr('_onConfigProcessed', onConfigProcessed);
        this.bind('loading', function(ev, newVal) {

            var $loader = $('loader[data-name="form-loader"]');
            if( $loader.length > 0 ) {

                var loader = $loader.viewModel();

                switch (newVal) {
                    case 'start':
                        loader.showLoader('full');
                        break;
                    case 'finish':
                        loader.showSuccess(null, $loader);
                        break;

                    default : loader.finishLoader();
                }

            }

        });
    },

    configProcessed: function () {
        return this._configProcessed;
    },

    processConfig: function(config) {

        if(this._configProcessed) {
            throw new Error('This method can be called only once!');
        }

        this._configProcessed = true;

        this.attr('structuredFields', new can.Map());
        this.attr('fields', new can.Map());
        this.attr('actions', new can.Map());
        this.attr('namedActions', new can.Map());
        this.attr('namedGroups', new can.Map());
        this.attr('areas', new can.Map());
        this.attr('titles', new can.Map());

        var titles = HtmlParser.makeArray(config.title);
        for (var k = 0; k < titles.length; k++) {
            var titleInstance = new Title(titles[k], this);
            this.titles.attr(titleInstance.attr('id'), titleInstance);
        }

        var fields = HtmlParser.makeArray(config.field);

        for (var i = 0; i < fields.length; i++) {
            var field = FieldFactory.createField(fields[i], this);
            var name = fields[i].attr('name');

            this.structuredFields.attr(name, field);

            if (field instanceof FieldGroup) {
                this._processGroupOfFields(field);
                if(name) {
                    this.namedGroups.attr(name, field);
                }
            } else {
                this.fields.attr(name, field);
            }
        }

        var actions = HtmlParser.makeArray(config.action);


        for (var j = 0; j < actions.length; j++) {
            var action = new StFormAction(actions[j], this);
            this.actions.attr(action.id, action);
            if(action.attr('_attributes.name')) {
                this.namedActions.attr(action.attr('_attributes.name'), action);
            }
        }

        var areaDefinitions = HtmlParser.makeArray(config['custom-area']);
        areaDefinitions.forEach(function (areaDefinition) {
            var area = new Area(areaDefinition, this);
            this.areas.attr(area.name, area);
        }, this);


        var callback = this.attr('_onConfigProcessed');
        if(callback) {
            callback.call(this);
        }

    },

    /**
     * @param [FieldGroup] fieldGroup
     * @private
     */
    _processGroupOfFields: function (fieldGroup) {
        var self = this;

        fieldGroup.fields.each(function (field, name) {
            field.attr('group', fieldGroup);
            self.fields.attr(name, field);
        });
    },

    setData : function (entity) {
        this.attr('entity', entity);
        this.clearErrors();
    },

    initFields : function() {
        this.fields.each(function(field) {
            if (typeof field.initField === 'function') {
                field.initField();
            }
        });
    },

    /**
     * @returns {string}
     */
    getFieldsPath : function() {
        return 'config.fields.';
    },

    /**
     * @returns {string}
     */
    getTitlesPath : function() {
        return 'config.titles.';
    },

    /**
     * @returns {string}
     */
    getAreasPath : function() {
        return 'config.areas.';
    },


    /**
     * @returns {string}
     */
    getStructuredFieldsPath: function() {
        return 'config.structuredFields.';
    },

    getActionsPath : function() {
        return 'config.actions.';
    },

    validateForm : function() {
        var result = new can.Deferred();
        var valid = true;
        this.fields.each(function (field) {

            var isInHiddenGroup = field.attr('group') && field.attr('group')._hidden();
            var isHidden = field._hidden() || isInHiddenGroup;

            if (!isHidden && typeof field.validateInput === 'function' && !field.validateInput()) {
                valid = false;
            }
        });

        if (valid) {
            result.resolve();
        } else {

            can.event.trigger.call( this, 'notValid');


            result.reject();
        }

        return result;
    },

    clearErrors : function() {

        if(this._configProcessed) {
            this.attr('fields').each(function(field) {
                field.attr('error', null);
            });
        }
    },

    setDefaultValues : function() {
        for (var i in this.fields.attr()) {
            if (this.fields.hasOwnProperty(i)) {
                var field = this.fields[i];
                if (typeof field.setDefaultValue === 'function') {
                    field.setDefaultValue();
                }
            }
        }
    },

    field : function(name) {
        return  this.fields.attr(name);
    },

    action: function (name) {
        return this.namedActions.attr(name);
    },

    group: function (name) {
        return this.namedGroups.attr(name);
    },

    /**
     *
     * @param {Array} intoArray
     */
    collectInitializationPromises: function (intoArray) {
        this.fields.each(function (field) {
            if (field.initialized !== null) {
                intoArray.push(field.initialized);
            }
        });
    },

    autofocus: function () {
        this.attr('fields').each(function (field) {
            if(field.autofocus) {
                can.$('#' + field.id).focus();
                return false;
            }
        });
    }
});

module.exports = StFormConfig;