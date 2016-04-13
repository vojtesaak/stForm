/**
 * Created by lukas on 19.6.15.
 */

    'use strict';

    var Field = require('./field');

    var FieldCheckbox = Field.extend({

        /**
         * Override the parent's method (swap Field and Label, we couldn't target it in CSS)
         * @returns {string}
         */
        getTemplate: function () {

            var html =  '{{#unless ' + this.getTemplateAttr('_hidden') + '}} ';
            html +=         '<div class="form-group' + this.hasErrorTemplate() + '">';
            html +=          this.getFieldTemplate() + this.getLabelTemplate() + this.getErrorTemplate();
            html +=         '</div>';
            html +=     '{{/unless}} ';

            return html;
        },

        /**
         *
         * @returns {string}
         */
        getFieldTemplate : function()
        {
            return '<input '
                   + 'type="checkbox"  id="' + this.id + '" '
                   + 'can-change="{' + this.getTemplateAttr('click') +' config.entity}" '
                   + '{{#if config.entity.'+this.name+'}}checked="checked"{{/if}} '
                   + '{{#if ' + this.getTemplateAttr('disabled') + '}} disabled="disabled" {{/if}}'
                   + '/>';
        },

        click : function(entity) {
            entity.attr(this.name, !entity.attr(this.name));
        }
    });

module.exports = FieldCheckbox;
