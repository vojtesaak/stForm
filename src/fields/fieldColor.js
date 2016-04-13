/**
 * Created by lukas on 11.6.15.
 */

    'use strict';

    var Field = require('./field');

    var FieldColor = Field.extend({

        colors: [
            'd57229', 'e7bb12', '842c57', 'af5fb6', '19175b', '1e2c75', '2874aa', '2fa049', '2abb8b'
        ],
        /**
         *
         * @returns {string}
         */
        getFieldTemplate : function()
        {
            return '<select id="' + this.id + '" class="colorpicker" data-width="60px" can-value="config.entity.' + this.name + '" ' + this.actionAttributes + '>'
                 + '{{#each ' + this.getTemplateAttr('colors') +'}}' + this.getOptionTemplate() +'{{/each}}'
                 + '</select>';
        },
        getOptionTemplate : function() {
            return '<option value="{{.}}"  data-content="<span class=\'select-color-label\' style=\'background-color: #{{.}}\'></span>">{{.}}</option>';
        },
        initField : function()
        {
            var $input = $('#'+this.id);
            if (!this.initialized) {
                this.attr('initialized', true);
                $input.selectpicker();
            } else {
                $input.selectpicker('refresh');
            }
        }
    });

module.exports = FieldColor;