/**
 * Created by lukas on 11.6.15.
 */
'use strict';

var Field = require('./field');

var FieldText = Field.extend({
    /**
     *
     * @returns {string}
     */
    getFieldTemplate : function()
    {
        return '<input '
               + 'class="form-control ' + (this.attr('autofocus') ? ' autofocus ' : '') + '" '
               + 'id="' + this.id + '" '
               + 'type="text" '
               + 'can-value="config.entity.' + this.name + '" '
               + 'placeholder="{{' + this.getTemplateAttr('placeholder') + '}}" '
               + '{{#if ' + this.getTemplateAttr('disabled') + '}} disabled="disabled" {{/if}}'
               + this.actionAttributes + '/>';
    }
});

module.exports = FieldText;