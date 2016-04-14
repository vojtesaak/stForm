/**
 * Created by lukas on 11.6.15.
 */

    'use strict';

    var Field = require('./field');

    var FieldPassword = Field.extend({
        /**
         *
         * @returns {string}
         */
        getFieldTemplate : function()
        {
            return '<input class="form-control" id="' + this.id + '" type="password" can-value="config.entity.' + this.name + '" '
                + this.actionAttributes + ' placeholder="{{' + this.getTemplateAttr('placeholder') + '}}" />';
        }
    });

module.exports = FieldPassword;