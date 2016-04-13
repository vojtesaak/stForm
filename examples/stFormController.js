
var can = require('can');
var stache = require('can/view/stache/stache');

var StFormConfig = require('../src/stFormConfig');


can.Component.extend({

    tag: 'my-component',

    template: function (data, options) {

        var template = can.view({
            url: 'form.handlebars'
        });

        var tpl = $('<div>').append(template(data, options)).html();
        return stache(tpl)(data, options);
    },



    viewModel: {

        formConfig: null,

        stFormData: null,

        entity : null,

        $element: null,

        init: function () {

            this.attr('entity',new can.Model({
                name: 'John',
                surname: 'Doe'
            }));

            var configProccessedCb = function() {
                this.namedActions.save.setCallback(function() {
                     console.log('saved');
                });
            };
            this.attr('formConfig', new StFormConfig(configProccessedCb));
        }

    },


    init: function(el) {
        this.viewModel.attr('$element', can.$(el));
    }
});


var template = stache("<my-component />");
can.$('body').append(template());


