/**
 * Created by lukas on 11.6.15.
 */

'use strict';

var Field = require('./field');

var FieldButton = Field.extend({

    spinning: false,

    getLabelTemplate: function () {
        return '';
    },


    /**
     *
     * @returns {string}
     */
    getFieldTemplate: function () {

        var spinningPath = this.getTemplateAttr('spinning');

        var classes = 'btn small primary ';
        classes += '{{#if ' + spinningPath + '}} spinning{{/if}}';

        //
        // NOTE for spinner styling see http://jsfiddle.net/AndrewDryga/GY6LC/
        // PRO TIP: for easy styling set temporary "spinning" attribute to 'true' (top of the file) :)
        //

        return '' +
            '<button class="' + classes + ' spinning" id="' + this.id + '" ' + this.actionAttributes +
                '{{#if ' + spinningPath + '}} disabled="disabled" {{/if}}' + '>' +
                    '{{#if ' + spinningPath + '}}<i class="glyphicon glyphicon-refresh" aria-hidden="true"></i>{{/if}}' +
                    '{{' + this.getTemplateAttr('title') + '}}' +
            '</button>';
    }
});

module.exports = FieldButton;