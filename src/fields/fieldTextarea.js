/**
 * Created by lukas on 11.11.15.
 */

'use strict';

var Field = require('./field');

var FieldTextarea = Field.extend({

    maxLength: null,

    init: function (config, formConfig) {
        this._super(config, formConfig);

        var maxLength = config.attr('max-length');
        if(typeof maxLength !== 'undefined') {
            this.attr('maxLength', maxLength);
        }
    },

    /**
     *
     * @returns {string}
     */
    getFieldTemplate : function()
    {
        var maxLengthAttr = '';
        var maxLength = this.attr('maxLength');
        if(maxLength != null) { // jshint ignore:line
            maxLengthAttr = 'maxlength="' + maxLength + '"';
        }

        return '<textarea '
               + 'class="form-control" '
               + 'id="' + this.id + '" '
               + 'can-value="config.entity.' + this.name + '" '
               +  maxLengthAttr + ' '
               + 'placeholder="{{' + this.getTemplateAttr('placeholder') + '}}" '
               + '{{#if ' + this.getTemplateAttr('disabled') + '}} disabled="disabled" {{/if}}'
               + this.actionAttributes
               + '>'
           + '</textarea>';
    }
});

module.exports = FieldTextarea;