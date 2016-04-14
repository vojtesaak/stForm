/**
 * Created by Václav Oborník on 21. 8. 2015.
 */

'use strict';

var can = require('can');
var HtmlParser = require('./utils/htmlParser');
var StFormConfig = require('./stFormConfig');

var stloader = require('stloader');


require('bootstrap-select-js');
require('../less/main.less!');
require('jquery.scrollto');

function _fullFillConfigFromInner(formConfig, data, options) {

    var outerDiv = document.createElement('div');
    var innerDiv = document.createElement('div');
    outerDiv.appendChild(innerDiv);

    var fragment = document.createDocumentFragment();
    fragment.appendChild(outerDiv);

    options.attr('tags').content(innerDiv, { //this replaces the inner div
        scope: data,
        options: options
    });

    var configObject = HtmlParser.parse(fragment, ['custom-area']).div;

    formConfig.processConfig(configObject);
}

can.Component.extend({

    tag: 'st-form',

    template: function (data, options) {

        var formConfig = data.attr('config');

        if (!formConfig.configProcessed()) {
            _fullFillConfigFromInner(formConfig, data, options);
            formConfig.setDefaultValues();
        }

        var html = '';

        html += '<loader data-name="form-loader"></loader>';
        html += '<div class="form-container">';
        html += '<div class="form-content">';

        data.attr('config').titles.each(function (title) {
            html += title.getTemplate();
        });

        data.attr('config').structuredFields.each(function (field) {
            html += field.getTemplate();
        });

        html += '<div class="form-areas">';
        data.attr('config').areas.each(function (area) {
            html += area.getTemplate();
        });
        html += '</div>';

        html += '</div>'; //form-content

        html += '</div>'; //container

        var actionsHtml = '';
        data.attr('config').actions.each(function (action) {
            actionsHtml += action.getTemplate();
        });

        if (actionsHtml) { //add footer only if there is any action
            html += '<div class="form-bottom">';
            html += actionsHtml;
            html += '</div>';
        }

        var resultFragment = can.stache(html)(data, options);

        data.attr('config').areas.each(function (area) {

            var areaContainer = resultFragment.querySelectorAll('#' + area.attr('id'))[0];
            var areaFragmentInner = area.getInnerFragment(options);

            var shouldBeHiddenCompute = area.getHiddenCompute();

            if (!shouldBeHiddenCompute()) {
                areaContainer.appendChild(areaFragmentInner);
            }

            var shouldBeHiddenListener = function (event, newShouldBeHidden) {
                var isHidden = areaFragmentInner.parentNode !== areaContainer;
                if (newShouldBeHidden && !isHidden) {
                    areaContainer.removeChild(areaFragmentInner);

                } else if (!newShouldBeHidden && isHidden) {
                    areaContainer.appendChild(areaFragmentInner);
                }
            };

            shouldBeHiddenCompute.bind('change', shouldBeHiddenListener);
            data._context.onRemovedCallbacks.push(function () {
                shouldBeHiddenCompute.unbind('change', shouldBeHiddenListener);
            });

        });
        return resultFragment;
    },

    viewModel: {

        $element: null,

        config: null,

        layout: 'horizontal',

        onRemovedCallbacks: [],

        init: function () {

            //ensure a formConfig
            // instance
            var self = this;

            var formConfig = this.attr('config');
            if (!formConfig) {
                formConfig = new StFormConfig();
                this.attr('config', formConfig);
            }

            formConfig.attr('visibleForm', this.attr('visibleForm'));
            this.bind('visibleForm', function (event, newValue) {
                formConfig.attr('visibleForm', newValue);
            });

            if (this.attr('entity')) {
                formConfig.setData(this.attr('entity'));
            }
            this.bind('entity', function (e, newEntity) {
                formConfig.setData(newEntity);
            });

            can.event.on.call( formConfig, 'notValid', function() {
                self.scrollToError();
            });

        },

        callAction: function (callbackName, element) {

            var callback = this.attr('config.namedActions.' + callbackName + '.callback');

            if ( callback && typeof callback === 'function') {
                callback();
                return
            }

            this.$element.trigger('callAction', {
                callback: callbackName,
                parameters: [this.config, can.$(element)]
            });

        },

        scrollToError: function () {
            var $el = this.$element;

            if ($el) {
                var $container = $el.find('.form-container');
                var $err = $container.find('.has-error');

                if ($err.length > 0 && $err.find('.focused').length === 0) {

                    var $focusedInput = $container.find('.has-error').eq(0).find('.form-control');

                    $focusedInput.addClass('focused');

                    var position = $focusedInput.parent().position().top;
                    var positionCont = $container.scrollTop();

                    if (position !== 0) {

                        $container.animate({
                            scrollTop: positionCont + position
                        }, 300, function () {
                            $focusedInput.removeClass('focused');
                        });
                    } else {
                        $focusedInput.removeClass('focused');
                    }
                }
            }
        }
    },

    helpers: {

        selected: function (fieldName, optionKey) {
            var field = this.config.entity.attr(fieldName);

            if (field && ((typeof field !== 'object' && field == optionKey) // jshint ignore:line
                          || (typeof field === 'object' && field.indexOf(optionKey) !== -1)))
            {

                return 'selected';
            } else {
                return '';
            }
        }

    },

    events: {
        removed: function () {
            this.viewModel.onRemovedCallbacks.splice(0).forEach(function (cb) {
                cb.call();
            });
        }
    },

    init: function (element) {
        this.scope.attr('$element', can.$(element));
    }
});