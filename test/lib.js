/* globals describe, before, after, it, beforeEach*/
"use strict";
require('should');
var clan         = require('../'),
	baseObjectId = 'baseObject',
	baseMixinId  = 'baseMixin',
	testID       = 'testObject';

describe('Clan', function(){
	it('should expose a function', function (){
		clan.should.be.a.Function;
	});
	it('should expose a mixin function', function (){
		clan.mixin.should.be.a.Function;
	});
	it('should expose a debug function', function (){
		clan.debug.should.be.a.Function;
	});

	describe('inheritance', function(){
		it('should return the baseObject class', function (){
			var Base = clan();
			Base.should.be.a.Function;
			(Base.prototype || false).should.be.ok;
			Base.prototype._id.should.eql(baseObjectId);
		});

		describe('extending a js object', function (){
			var Cls = clan({},{name: testID});

			it('should be a constructor of ' + testID, function () {
				Cls.should.be.a.Function;
				Cls.name.should.eql('ClanConstructor');
				(Cls.prototype || false).should.be.ok;
				Cls.prototype._id.should.eql(testID);
			});

			it('should throw an error if trying to initiate without new', function () {
				(Cls).should.throw('Missing `new` pefix when invoking constructor ' + testID);
			});

			it('should be able to instance a child', function () {
				(new Cls()).should.be.instanceOf(Cls);
			});

			it('should be extendable', function (){
				var id = 'child',
					expectedId = testID + '_' + id,
					Child = clan(Cls, {name: id});
				Child.should.be.a.Function;
				(Child.prototype || false).should.be.ok;
				Child.prototype._id.should.eql(expectedId);
			});

			it('should append `E` when child doesn\'t have a name', function (){
				var expectedId = testID + '_E',
					Child = clan(Cls, {});
				Child.should.be.a.Function;
				(Child.prototype || false).should.be.ok;
				Child.prototype._id.should.eql(expectedId);
			});
		});

		describe('extending a base object', function (){
			var expectedId = baseObjectId + '_' + testID,
				Cls = clan({name: testID});

			it('should be a constructor of ' + expectedId, function () {
				Cls.should.be.a.Function;
				(Cls.prototype || false).should.be.ok;
				Cls.prototype._id.should.eql(expectedId);
			});

			it('should have a create method', function () {
				Cls.create.should.be.a.Function;
			});

			it('should be able to instance a child', function () {
				(new Cls()).should.be.instanceOf(Cls);
				Cls.create().should.be.instanceOf(Cls);
			});

			it('should have an extend method', function () {
				Cls.extend.should.be.a.Function;
			});

			it('should be extendable', function (){
				var id  = 'child',
					expectedId = Cls.prototype._id + '_' + id,
					Child = clan(Cls, {name: id});

				Child.should.be.a.Function;
				(Child.prototype || false).should.be.ok;
				Child.prototype._id.should.eql(expectedId);
				Child = Cls.extend({name: id});
				Child.should.be.a.Function;
				(Child.prototype || false).should.be.ok;
				Child.prototype._id.should.eql(expectedId);
			});

			it('should throw an error when calling init on class', function () {
				(Cls.prototype.init.bind(Cls.prototype)).should.throw('Cannot call init before create');
			});

			it('should allow accessing parent function with _super', function () {
				var calls = 0,
					Child = Cls.extend({name: 'child', create: function () {
						calls += 1;
						return this._super();
					}}),
					Child2 = Child.extend({name: 'child2', create: function () {
						calls += 1;
						return this._super();
					}});

				(new Child2()).should.be.instanceOf(Child2);
				calls.should.eql(2);
			});
		});

		describe('debug mode', function (){
			var Cls,
				expectedId = baseObjectId + '_' + testID;
			before(function(){
				clan.debug(true);
				Cls = clan({name: testID});
			});

			describe('extending an base object', function (){
				it('should be a constructor Function', function () {
					Cls.should.be.a.Function;
					(Cls.prototype || false).should.be.ok;
				});

				it('should be a constructor of ' + expectedId + ' with name', function () {
					Cls.prototype._id.should.eql(expectedId);
					Cls.name.should.eql(expectedId);
				});

				it('should change class toString to return id', function () {
					Cls.toString().should.eql(expectedId);
				});
			});

			it('should allow accessing original function from _super', function () {
				var params = {name: 'child', create: function () {
						return this._super();
					}},
					Child = Cls.extend(params);

				params.create.should.be.eql(Child.prototype.create._target);
				params.create.toString().should.be.eql(Child.prototype.create.toString());
			});
		});
	});

	describe('mixins', function(){
		it('should return the baseMixin class', function (){
			var Base = clan.mixin();
			Base.should.be.a.Function;
			(Base.prototype || false).should.be.ok;
			Base.prototype._id.should.eql(baseMixinId);
		});

		describe('mixin a js object', function (){
			var Mix = clan.mixin({}, {name: testID});

			it('should be a constructor of ' + testID, function () {
				Mix.should.be.a.Function;
				Mix.name.should.eql('ClanMixer');
				(Mix.prototype || false).should.be.ok;
				Mix.prototype._id.should.eql(testID);
			});

			it('should be able to instance a child', function () {
				(new Mix()).should.be.instanceOf(Mix);
			});

			it('should be mixable', function (){
				var id = 'child',
					expectedId = testID + '_' + id,
					Child = clan.mixin(Mix, {name: id});
				Child.should.be.a.Function;
				(Child.prototype || false).should.be.ok;
				Child.prototype._id.should.eql(expectedId);
				Child = Mix.mixin({name: id});
				Child.should.be.a.Function;
				(Child.prototype || false).should.be.ok;
				Child.prototype._id.should.eql(expectedId);
			});

			it('should append `M` when child doesn\'t have a name', function (){
				var expectedId = testID + '_M',
					Child = clan.mixin(Mix, {});
				Child.should.be.a.Function;
				(Child.prototype || false).should.be.ok;
				Child.prototype._id.should.eql(expectedId);
			});

			it('should create new instance when invoked with `new`', function (){
				var target = new Mix(target);
				target.should.be.instanceOf(Mix);
			});

			it('should mix into target when invoked', function (){
				var target = {},
					tmpTarget = Mix(target);
				tmpTarget.should.be.eql(target);
			});

			it('should throw an error when invoked with `new` and target', function (){
				(function (){
					new Mix({});
				}).should.throw('Cannot pass target to Mixin when invoked with `new` ' + testID);
			});

		});

		describe('mixin a base mixin', function (){
			var expectedId = baseMixinId + '_' + testID,
				Mix = clan.mixin({name: testID});

			it('should be a constructor of ' + expectedId, function () {
				Mix.should.be.a.Function;
				(Mix.prototype || false).should.be.ok;
				Mix.prototype._id.should.eql(expectedId);
			});

			it('should have a implements method', function () {
				Mix.implements.should.be.a.Function;
			});

			it('should be able to instance a child', function () {
				(new Mix()).implements(Mix).should.be.ok;
				(Mix()).implements(Mix.prototype).should.be.ok;
			});

			it('should allow accessing parent function with _super', function () {
				var calls = 0,
					child = Mix.mixin({name: 'child', implements: function (mix) {
						calls += 1;
						return this._super(mix);
					}}),
					instance = child({implements: function (mix) {
						calls += 1;
						return this._super(mix);
					}});

				instance.implements(child);
				calls.should.eql(2);
			});
		});

		describe('debug mode', function (){
			var Mix,
				expectedId = baseMixinId + '_' + testID;
			before(function(){
				clan.debug(true);
				Mix = clan.mixin({name: testID});
			});

			describe('extending an base mixin', function (){
				it('should be a constructor Function', function () {
					Mix.should.be.a.Function;
					(Mix.prototype || false).should.be.ok;
				});

				it('should be a constructor of ' + expectedId + ' with name', function () {
					Mix.prototype._id.should.eql(expectedId);
					Mix.name.should.eql(expectedId);
				});

				it('should change class toString to return id', function () {
					Mix.toString().should.eql(expectedId);
				});
			});

			it('should allow accessing original function from _super', function () {
				var params = {name: 'child', implements: function () {
						return this._super();
					}},
					Child = Mix.mixin(params);

				params.implements.should.be.eql(Child.prototype.implements._target);
				params.implements.toString().should.be.eql(Child.prototype.implements.toString());
			});
		});
	});
});