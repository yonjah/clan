var clan = (function (global) {
	"use strict";
	var exp,
		_ = {
			extend: function extendObject (target, source) {
				Object.keys(source).forEach(function (key){
					target[key] = source[key];
				});
				return target;
			}
		}, baseMixin = {
			implements: function calnImplements (source) {
				return Object.keys(source.prototype || source).reduce(function (res, key) {
					return res && this[key] !== undefined;
				}.bind(this), true);
			}
		},
		baseObj = {
			name: 'baseObject',
			create:  function calnCreate (options) {
				var obj;
				if (isFunc(this._c) && !(this instanceof this._c)) {
					return new this._c(options); // re call create with constructor
				}
				obj = this;
				Object.defineProperty(obj, '_instance', {value: true});
				return obj.init(options);
			},
			init:  function calnInit (options) {
				if (!this._instance) {
					throw new Error('Cannot call init before create');
				}
				options = options || {};
				!options.init && Object.defineProperty(this, 'init', {value: undefined});
				!options.create && Object.defineProperty(this, 'create', {value: undefined});
				return _.extend(this, options);
			},
			toString: function calnToString () {
				return this._id + (this.isInstance()? '(I)' : '');
			},
			isInstance: function isInstance () {
				return this._instance || false;
			},
			extend: function calnExtend (obj) {
				return extend.call(null, this, obj);
			}
		};

	function isFunc (obj) {
		return typeof obj === 'function';
	}

	function mkSuper (child, parent, param) {
		var parentFunc = parent[param],
			childFunc = child[param],
			func = function _super () {
				var result, lastSuper;
				if (!this.hasOwnProperty('_super')) {
					Object.defineProperty(this, '_super', {writable: true});
				}
				lastSuper = this._super;
				this._super = parentFunc;
				result = childFunc.apply(this, arguments);
				this._super = lastSuper;
				return result;
			};
		//for easier debugging
		Object.defineProperty(func, '_target', {value: childFunc._target || childFunc});
		func.toString = func._target.toString.bind(func._target);
		return func;
	}

	function superExtend(target, source, parent, param) {
		if (isFunc(source[param]) && isFunc(parent[param]) && source[param].toString().indexOf('this._super') >= 0) {
			target[param] = mkSuper(source, parent, param);
		} else {
			target[param] = source[param];
		}
		return target[param];
	}

	function createMixinFunction() {
		function Mix (target) {
			target = target || {};
			if (this && this.constructor === Mix) { //called with new so we can only mix target into this
				_.extend(this, target);
				Object.defineProperty(this, '_instance', {value: true});
				return this;
			} else {
				_.extend(target, Mix.prototype);
				Object.keys(target).forEach(superExtend.bind(null, target, target, Mix.prototype));
				Object.defineProperty(target, '_instance', {value: true});
				return target;
			}
		}
		return Mix;
	}

	function mixin(parent, child) {
		var obj,
			id = (parent._id ? parent._id + '_':'') + (child.name || 'M');

		obj = createMixinFunction();
		_.extend(obj.prototype, parent);
		obj.mixin = mixin.bind(null, obj.prototype);

		Object.defineProperty(obj.prototype, '_id', {value: id});
		Object.keys(child).forEach(superExtend.bind(null, obj.prototype, child, parent));
		obj.implements = obj.prototype.implements.bind(obj.prototype);
		return obj;
	}

	function extend(parent, child) {
		var obj, Constructor,id;
		parent = parent.prototype || parent;
		id = (parent._id ? parent._id + '_':'') + (child.name || 'E');


		eval('Constructor = function ' + id + '(){ return this.create.apply(this, arguments)}');

		obj = Object.create(parent);

		Constructor.prototype = obj;
		Object.defineProperty(obj, '_c', {value: Constructor});
		Object.defineProperty(obj, '_id', {value: id});

		Object.keys(child).forEach(superExtend.bind(null, obj, child, parent));
		Constructor.create = obj.create.bind(obj);
		Constructor.toString = obj.toString.bind(obj);
		Constructor.extend = obj.extend.bind(obj);

		return Constructor;
	}

	baseObj = extend({}, baseObj);

	exp = baseObj.extend;
	baseMixin = mixin({}, baseMixin);
	exp.mixin = baseMixin.mixin;

	return exp;
}(this || window || global));

module.exports = clan;