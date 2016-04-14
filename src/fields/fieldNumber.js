/**
 * Created by Václav Oborník on 14.1.2016.
 */

'use strict';

var Field = require('./field');
var parseFloatHuman = require('../utils/parseFloatHuman');

var FieldNumber = Field.extend({

    min: null,

    max: null,

    init: function (config, formConfig) {
        this._super(config, formConfig);
        this.attr({
            min: (config.attr('min') && parseFloatHuman(config.attr('min'))),
            max: (config.attr('max') && parseFloatHuman(config.attr('max')))
        }, false);
    },

    /**
     *
     * @returns {string}
     */
    getFieldTemplate : function() {
        return '<input '
               + 'class="form-control ' + (this.attr('autofocus') ? ' autofocus ' : '') + '" '
               + 'id="' + this.id + '" '
               + 'type="text" ' // don't use 'number' input type, it's not user friendly (no spaces allowed)
               + (typeof this.attr('min') !== 'undefined' ? 'min="' + this.attr('min') + '"' : '')
               + (typeof this.attr('max') !== 'undefined' ? 'max="' + this.attr('max') + '"' : '')
               + 'can-value="config.entity.' + this.name + '" '
               + 'placeholder="{{' + this.getTemplateAttr('placeholder') + '}}" '
               + '{{#if ' + this.getTemplateAttr('disabled') + '}} disabled="disabled" {{/if}}'
               + this.actionAttributes + '/>';
    }
});

module.exports = FieldNumber;