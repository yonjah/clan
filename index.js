(function () {
	"use strict";
	var exp,
		debug = false,
		_ = {
			extend: function extendObject (target, source) {
				Object.keys(source).forEach(function (key){
					target[key] = source[key];
				});
				return target;
			}
		}, baseMixin = {
			implements: function clanImplements (source) {
				return Object.keys(source.prototype || source).reduce(function (res, key) {
					return res && this[key] !== undefined;
				}.bind(this), true);
			}
		},
		baseObj = {
			name: 'baseObject',
			create:  function clanCreate (options) {
				if (isFunc(this._c) && !(this instanceof this._c)) {
					return new this._c(options); // re call create with constructor
				}
				Object.defineProperty(this, '_instance', {value: true});
				return this.init(options);
			},
			init:  function clanInit (options) {
				if (!this._instance) {
					throw new Error('Cannot call init before create');
				}
				options = options || {};
				!options.init && Object.defineProperty(this, 'init', {value: undefined});
				!options.create && Object.defineProperty(this, 'create', {value: undefined});
				return _.extend(this, options);
			},
			extend: function clanExtend (obj) {
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
		if (debug) { //easy access to original func without the wrapper to make debugging easier
			Object.defineProperty(func, '_target', {value: childFunc._target || childFunc});
			func.toString = func._target.toString.bind(func._target);
		}
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
		var obj, Constructor,id,
			expose = ['create', 'extend'];
		parent = parent.prototype || parent;
		id = (parent._id ? parent._id + '_':'') + (child.name || 'E');

		if (debug) { //object name in console
			eval('Constructor = function ' + id + '(){return this.create.apply(this, arguments);}');
		} else {
			Constructor = function Constructor (){
				return this.create.apply(this, arguments);
			};
		}

		obj = Object.create(parent);

		Constructor.prototype = obj;
		Object.defineProperty(obj, '_c', {value: Constructor});
		Object.defineProperty(obj, '_id', {value: id});

		Object.keys(child).forEach(superExtend.bind(null, obj, child, parent));

		expose.forEach(function (key){
			isFunc(obj[key]) && (Constructor[key] = obj[key].bind(obj));
		});

		return Constructor;
	}

	baseObj = extend({}, baseObj);
	baseMixin = mixin({}, baseMixin);

	exp = function (parent, child) {
		return extend(child ? parent : baseObj, child || parent);
	};
	exp.mixin = function (parent, child) {
		return mixin(child ? parent : baseMixin, child || parent);
	};
	exp.debug = function (val){
		debug = val;
	};
	//module detection and define code from lodash http://lodash.com
	/*globals window, define*/
	var root = (typeof window !== 'undefined') && window || this,
		freeExports = (typeof exports !== 'undefined') && exports && !exports.nodeType && exports,
		freeModule = (typeof module !== 'undefined') && module && !module.nodeType && module,
		moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
		freeGlobal = (typeof global !== 'undefined') && global;

	if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
		root = freeGlobal;
	}

	if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
		define(function() {
			return exp;
		});
	} else if (freeExports && freeModule) {
		if (moduleExports) {
			freeModule.exports = exp;
		}
		else {
			freeExports.clan = exp;
		}
	} else {
		root.clan = exp;
	}
}.call(this));