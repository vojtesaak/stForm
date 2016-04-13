/**
 * Created by vojtechmalek on 12.1.16.
 */

'use strict';

var Field = require('./field');

var FieldDate = Field.extend({

    init: function(config,formConfig) {
        this._super(config, formConfig);

        var type = config.attr('type').toLowerCase();

        this.type = type === 'date' ? type : type + '-local';
    },
    /**
     *
     * @returns {string}
     */
    getFieldTemplate : function() {

        return '<input '
               + 'class="form-control ' + (this.attr('autofocus') ? ' autofocus ' : '') + '" '
               + 'id="' + this.id + '" '
               + 'type="'+ this.type + '" '
               + 'min="{{' + this.getTemplateAttr('min') + '}}"'
               + 'max="{{' + this.getTemplateAttr('max') + '}}"'
               + 'can-value="config.entity.' + this.name + '" />';
    }
});

module.exports = FieldDate;
