/**
 * Created by davidmenger on 20/02/15.
 */

    'use strict';

    var can = require('can');

    var _nodeName = function(htmlNode) {
        return htmlNode.tagName.toLowerCase();
    };

    var HtmlParser = function() {



    };

    var ConfigNode = function(htmlNode, parentCfg)
    {
        this._name = _nodeName(htmlNode);
        this._htmlNode = htmlNode;
        this._parentCfgNode = parentCfg;

        if (htmlNode.children.length === 0) {
            this._value = htmlNode.textContent;
        }
        this._attributes = {};
        for (var i = 0; i < htmlNode.attributes.length; i++) {
            var attr = htmlNode.attributes[i];
            if (attr.specified) {
                var name = attr.name;
                if (attr.name.match(/^data-/)) {
                    name = name.replace(/^data-/, '');
                }
                this._attributes[name] = attr.value;
            }
        }
    };

    ConfigNode.prototype = {

        _attributes: null,

        _name: null,

        _value: null,

        _htmlNode: null,

        _parentCfgNode: null,

        /**
         *
         * @param key
         * @returns {*|null}
         */
        attr : function(key)
        {
            return this._attributes[key];
        },

        hasAttr: function (key) {
            return this._attributes.hasOwnProperty(key);
        },

        /**
         * @param {string} key
         * @returns {*[]}
         */
        list : function (key) {
            var val = this[key];
            return HtmlParser.makeArray(val);
        },

        /**
         * @param key
         * @returns {*}
         */
        allAttributes: function()
        {
            return this._attributes;
        },

        /**
         *
         * @returns {string}
         */
        name : function()
        {
            return this._name;
        },

        /**
         *
         * @returns {string}
         */
        value : function()
        {
            return this._value;
        },

        /**
         *
         * @param forHtmlNode
         * @returns {ConfigNode}
         * @private
         */
        _parent : function (forHtmlNode)
        {
            if (typeof forHtmlNode === 'undefined') {
                return this._parentCfgNode;
            } else if (forHtmlNode === this._htmlNode || this._parentCfgNode === null) {
                return this
            } else {
                return this._parentCfgNode._parent(forHtmlNode);
            }
        },

        /**
         *
         * @private
         */
        _clear : function (notParsedTags)
        {
            if(notParsedTags.indexOf(this._name) === -1) {
                this._parentCfgNode = null;
                this._htmlNode = null;
            }

            for (var attrName in this) {
                if (this.hasOwnProperty(attrName) && this[attrName] !== null && typeof this[attrName] === 'object' && attrName !== '_parentCfgNode') {
                    var f = this[attrName];
                    if (typeof f._clear === 'function') {

                        f._clear(notParsedTags);
                    } else if (Object.prototype.toString.call(f) === '[object Array]') {
                        for (var k = 0; k < f.length; k++) {

                            f[k]._clear(notParsedTags);
                        }
                    }
                }
            }
        }

    };



    HtmlParser.parse = function(subtemplate, notParsedTags)
    {
        var ret = {},
            lastParentNode = null,
            lastNode = null,
            current = ret;

        notParsedTags = notParsedTags || [];

        can.$.each(subtemplate.querySelectorAll('*'), function(key, htmlNode){

            if (htmlNode.parentElement === lastNode) {
                if (htmlNode.parentElement !== lastParentNode) {
                    // go in
                    var lastNodeName = _nodeName(lastNode);

                    if (Object.prototype.toString.call( current[lastNodeName] ) === '[object Array]') {
                        current = current[lastNodeName][current[lastNodeName].length - 1];
                    } else {
                        current = current[lastNodeName];
                    }
                }
            } else {
                // go out

                current = current._parent(htmlNode.parentElement);
            }

            var cfg = new ConfigNode(htmlNode, current);

            if (Object.prototype.toString.call( current[cfg.name()] ) === '[object Array]') {
                current[cfg.name()].push(cfg);
            } else if (typeof current[cfg.name()] !== 'undefined') {
                current[cfg.name()] = [ current[cfg.name()] ];
                current[cfg.name()].push(cfg);
            } else {
                current[cfg.name()] = cfg;
            }

            lastNode = htmlNode;
            lastParentNode = htmlNode.parentElement;
        });

        for (var i in ret) {
            if (ret[i] !== null && typeof ret[i] === 'object' && typeof ret[i]._clear === 'function') {
                ret[i]._clear(notParsedTags);
            }
        }


        return ret;
    };

    HtmlParser.makeArray = function(val)
    {
        if (typeof val === 'undefined' || val === null) {
            return [];
        } else if (Object.prototype.toString.call( val ) !== '[object Array]') {
            return [val];
        } else {
            return val;
        }
    };

module.exports = HtmlParser;