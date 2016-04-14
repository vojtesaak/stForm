/**
 * Created by lukas on 6.10.15.
 */

'use strict';

var can = require('can');
var debounce = require('lodash/function/debounce');

var Select = can.Map.extend({}, {
    staticOptions: null,
    options: null,
    $input: null,
    value: null,
    optionsCache: null,
    ajaxInfo: null,
    config: null,
    reservedKeys: ['dataValueField', 'textPicker'],
    noneSelectedText: 'Nothing selected',
    _parameters: null,
    _filter: null,
    _filteredOptions: null,

    /**
     *
     * @param {object} config
     * @param {object} parameters
     */
    init: function (config, parameters) {
        var self = this;
        this._parameters = parameters || {};
        this.noneSelectedText = this._parameters.noneSelectedText || this.noneSelectedText;
        this.setFilter(this._parameters.filter);
        this.config = config;
        var options = this.options = new can.List([]);
        this.attr('optionsCache', new can.Map({}));

        this._filteredOptions = can.compute(function () {
            var filter = self.attr('_filter');
            if(filter) {
                return options.filter(filter);
            } else {
                return options.slice();
            }
        });

        this._filteredOptions.bind('change', function () {
            self._refreshOptions();
        });
    },

    setFilter: function (filter) {
        this.attr('_filter', filter || null);
    },

    /**
     * Returns array of static options (from template) - if it was not initialized, it is
     * initialized on first call of this method
     * @returns {array}
     * @private
     */
    _getStaticOptions: function () {
        if (!this.staticOptions) {
            var options = [];
            var staticOptions = this.config['static-option'];

            if (typeof staticOptions !== 'undefined') {
                staticOptions = this._makeArray(staticOptions);

                for (var i = 0; i < staticOptions.length; i++) {
                    var option = staticOptions[i];

                    options.push({
                        value: option._attributes.value,
                        text: option.value()
                    });
                }
            }

            this.attr('staticOptions', options);
        }

        return this.staticOptions.attr();
    },

    /**
     *
     * @param {Promise|array|object|Model} data
     * @param {object} [modelParams]
     */
    setOptions: function (data, modelParams) {
        var self = this;
        var optionsPromise = new can.Deferred();
        var ajaxOptions = false;

        var makeOptionsArray = function (object) {
            object = object || [];
            if (!can.isArray(object)) {
                var newData = [];
                for (var i in object) {
                    if (object.hasOwnProperty(i)) {
                        newData.push({
                            value: i,
                            text: object[i]
                        });
                    }
                }
                return newData;
            } else {
                return object;
            }
        };

        if (can.isDeferred(data)) {
            optionsPromise = data.then(function (options) {
                options = makeOptionsArray(options);
                self.$input.on('shown.bs.select', function () {
                    if (typeof self._parameters.shownCallback === 'function') {
                        self._parameters.shownCallback();
                    }
                });

                return options.concat(self._getStaticOptions());
            });
        } else if (data && typeof data.findAll === 'function') {
            ajaxOptions = true;
            this._setAjaxOptions(data, modelParams);
            optionsPromise.resolve(this._getStaticOptions());
        } else {
            data = makeOptionsArray(data);
            var optionsData = data.concat(this._getStaticOptions());
            self.$input.on('shown.bs.select', function () {
                if (typeof self._parameters.shownCallback === 'function') {
                    self._parameters.shownCallback();
                }
            });

            optionsPromise.resolve(optionsData);
        }

        optionsPromise.then(function (options) {
            if (!ajaxOptions && typeof self.value() === 'undefined' && options.length > 0) {
                self.value(options[0].value);
            }
            self.options.replace(self._removeDuplicateOptions(options));
        });
    },

    /**
     * Regenerates options html code and refreshes select picker
     * @private
     */
    _refreshOptions: function () {
        if (this.$input && this.value) {
            var html = '';
            this._filteredOptions().each(function (option) {
                html += '<option value="' + can.esc(option.value) + '">' + can.esc(option.text) + '</option>';
            });

            this.$input.html(html);

            this.$input.selectpicker('refresh').selectpicker('setStyle', 'btn-default', 'remove');
            this._setInputValue(this.value());
        }
    },

    /**
     * Initializes select box element
     * @param {object} $input
     */
    setForElement: function ($input) {
        var self = this;

        this.attr('$input', $input);

        if (typeof this.$input.data('selectpicker') === 'undefined') {
            $input
                .selectpicker({
                    noneSelectedText: this.noneSelectedText,
                    liveSearch: true,
                    selectedTextFormat: 'count>0'
                })
                .selectpicker('setStyle', 'btn-default', 'remove');

            $input.on('change', function () {
                var value = $input.val();
                if (value === 'null') {
                    value = null;
                }

                self.value(value);
            });
        }

        this._refreshOptions();
    },

    /**
     * Sets computable value when entity changes
     * @param {function} value
     */
    setValue: function (value) {
        var self = this;
        this.value = value;

        var doPrefetch = true;

        var computedValue = value();
        if (typeof computedValue === 'undefined') {
            doPrefetch = false;
        }

        if (this._isValueAvailable(computedValue)) {
            this._setInputValue(computedValue);
        } else {
            if (doPrefetch) {
                this._prefetchValue(computedValue).then(function () {
                    self._refreshOptions();
                    self._setInputValue(computedValue);
                });
            }
        }
    },

    _insertNewValue: function (value) {
        this.options.replace([{
            value: value,
            text: value
        }]);

        this.optionsCache.attr(value, value);
        this.value(value);
        this._setInputValue(value);
    },

    /**
     *
     * @param {string|number|array} value
     * @returns {can.Deferred}
     * @private
     */
    _prefetchValue: function (value) {
        var self = this;
        var deferred = new can.Deferred();

        value = this._makeArray(value);

        var values = [];
        var valuesToFetch = [];

        value.forEach(function (val) {
            if (typeof self.optionsCache[val] !== 'undefined') {
                values.push({
                    value: val,
                    text: self.optionsCache[val]
                });
            } else {
                valuesToFetch.push(val);
            }
        });

        if (this.ajaxInfo && valuesToFetch.length > 0) {

            var prefetchData = {};

            var reservedKeys = ['search'].concat(this.reservedKeys.serialize());

            var ajaxData = this.ajaxInfo.params.attr('');

            for (var prop in ajaxData) {
                if (ajaxData.hasOwnProperty(prop) && reservedKeys.indexOf(prop) === -1) {
                    prefetchData[prop] = ajaxData[prop];
                }
            }

            prefetchData.limit = valuesToFetch.length;
            prefetchData[this.ajaxInfo.params.dataValueField] = valuesToFetch.join(',');

            if (typeof prefetchData.fields !== 'string') {
                prefetchData.fields = prefetchData.fields.join(',');
            }

            can.ajax({
                url: this.ajaxInfo.model.resource,
                type: 'GET',
                data: prefetchData
            }).then(function (data) {
                self._replaceOptionsFromRequest(data);
                deferred.resolve();
            });
        } else {
            this.options.replace(this._removeDuplicateOptions(values));
            deferred.resolve();
        }

        return deferred;
    },

    /**
     *
     * @param {object} Model
     * @param {object} modelParams
     * @private
     */
    _setAjaxOptions: function (Model, modelParams) {
        var self = this;
        var found = false;

        var requestData = {};
        var emptyRequestData = {};

        for (var i in modelParams) {
            if (modelParams.hasOwnProperty(i) && this.reservedKeys.indexOf(i) === -1) {
                if (modelParams[i] === '{{{q}}}') {
                    found = true;
                } else {
                    requestData[i] = modelParams[i];
                    emptyRequestData[i] = modelParams[i];
                }
            }
        }

        if (!found) {
            requestData.search = '{{{q}}}';
        }

        this.attr('ajaxInfo', {
            model: Model,
            params: modelParams
        });

        var request = {
            url: Model.resource,
            type: 'GET',
            data: requestData
        };

        var emptyRequest = {
            url: Model.resource,
            type: 'GET',
            data: emptyRequestData
        };

        this.$input.on('shown.bs.select', function () {
            can.ajax(emptyRequest).then(function (data) {
                self._replaceOptionsFromRequest(data);
                if (typeof self._parameters.shownCallback === 'function') {
                    self._parameters.shownCallback();
                }
            });
        });

        var ignoredKeys = {
            9: 'tab',
            13: 'enter',
            16: 'shift',
            17: 'ctrl',
            18: 'alt',
            27: 'esc',
            37: 'left',
            39: 'right',
            38: 'up',
            40: 'down',
            91: 'meta',
            229: 'unknown'
        };

        var loadedDataLength = 0;
        this.$input.data('selectpicker').$searchbox.on('keyup', debounce(function (e) {
            if (typeof ignoredKeys[e.keyCode] === 'undefined') {
                requestData.search = $(this).val();
                can.ajax(request).then(function (data) {
                    loadedDataLength = data.data.length;
                    self._replaceOptionsFromRequest(data);
                    if (self.config.attr('quick-create') && loadedDataLength === 0) {
                        self.$input.data('selectpicker').$newElement.find('li.no-results').append('<span class="quick-create">Insert</span>');
                    }
                });
            } else if (self.config.attr('quick-create') && ignoredKeys[e.keyCode] === 'enter' && loadedDataLength === 0) {
                self._insertNewValue($(this).val());
                self.$input.data('selectpicker').$newElement.removeClass('open').find('button').attr('aria-expanded', false);
            }
        }, 250));
    },

    /**
     *
     * @param {object} data
     * @private
     */
    _replaceOptionsFromRequest: function (data) {
        var self = this;
        var options = self._getSelectedOptions();

        data.data.forEach(function (item) {
            var itemToPush;

            if (typeof item === 'string') {
                itemToPush = {
                    value: item,
                    text: item
                };
            } else {
                itemToPush = {
                    value: item[self.ajaxInfo.params.dataValueField],
                    text: self._getItemText(item)
                };
            }

            options.push(itemToPush);

            self.optionsCache.attr(itemToPush.value, itemToPush.text);
        });

        options = options.concat(this._getStaticOptions());

        self.options.replace(this._removeDuplicateOptions(options));
        if (typeof self.value() === 'undefined') {
            self.value(self.$input.val());
        }

        self._setInputValue(self.value());
    },

    _getItemText: function (item) {
        if (typeof this.ajaxInfo.params.textPicker === 'function') {
            return this.ajaxInfo.params.textPicker(item);
        } else if (typeof this.ajaxInfo.params.fields === 'string') {
            return item[this.ajaxInfo.params.fields];
        } else {
            var ret = [];
            if (this.ajaxInfo.params.fields.length) {
                this.ajaxInfo.params.fields.forEach(function (field) {
                    ret.push(item[field]);
                });
            }

            return ret.join(' ');
        }

    },

    /**
     *
     * @param {string|number|array} value
     * @returns {boolean}
     * @private
     */
    _isValueAvailable: function (value) {
        var self = this;

        value = this._makeArray(value);

        var isInOptions = function (val) {
            var found = false;
            self._filteredOptions().forEach(function (item) {
                if (item.value == val) { // jshint ignore:line
                    found = true;
                }
            });

            return found;
        };

        var isAllAvailable = true;
        value.forEach(function (val) {
            if (!isInOptions(val)) {
                isAllAvailable = false;
            }
        });

        return isAllAvailable;
    },

    /**
     *
     * @returns {Array}
     * @private
     */
    _getSelectedOptions: function () {
        var self = this;
        var selected = this.value();
        selected = this._makeArray(selected);

        var ret = [];
        selected.forEach(function (value) {
            if (typeof self.optionsCache[value] !== 'undefined') {
                ret.push({
                    value: value,
                    text: self.optionsCache[value]
                });
            }
        });

        return ret;
    },

    /**
     *
     * @param {null|array|string} value
     * @returns {*}
     * @private
     */
    _makeArray: function (value) {
        if (!value) {
            return [];
        } else if (typeof value === 'string' || typeof value.length === 'undefined') {
            return [value];
        } else {
            var values = [];
            value.forEach(function (val) {
                values.push(val);
            });

            return values;
        }
    },

    /**
     *
     * @param {array} options
     * @returns {Array}
     * @private
     */
    _removeDuplicateOptions: function (options) {
        var usedValues = {};
        var ret = [];

        options.forEach(function (option) {
            if (typeof usedValues[option.value] === 'undefined') {
                usedValues[option.value] = option.text;
                ret.push(option);
            }
        });

        return ret;
    },

    /**
     *
     * @param {string} val
     * @private
     */
    _setInputValue: function (val) {

        if (val === null) {
            val = 'null';
        }

        if (typeof val === 'object' && typeof val.attr === 'function') {
            val = val.attr();
        }

        this.$input.val(val);
        this.$input.selectpicker('refresh');
    }
});

module.exports = Select;