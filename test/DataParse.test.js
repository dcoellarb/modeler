/* global define, it, describe */

import { expect } from 'chai';
import sinon from 'sinon';
import Parse from 'parse';
import DataParse from './../DataParse.js';

describe('DataParse.js', () => {
  const dataParse = DataParse.getInstance();

  describe('test logError', () => {
    it('209 logout', () => {
      const logOutStub = sinon.stub(Parse.User, 'logOut');
      dataParse.logError('Test Method', { code: 209, message: 'test error message' });
      logOutStub.restore();
      expect(logOutStub.called).to.be.true;
    });
  });
  describe('test buildFilter', () => {
    const parseQueryStub = {
      equalTo: (field, value) => {
        expect(field).to.not.be.undefined;
        expect(value).to.not.be.undefined;
      },
      greaterThan: (field, value) => {
        expect(field).to.not.be.undefined;
        expect(value).to.not.be.undefined;
      },
      greaterThanOrEqualTo: (field, value) => {
        expect(field).to.not.be.undefined;
        expect(value).to.not.be.undefined;
      },
      lessThan: (field, value) => {
        expect(field).to.not.be.undefined;
        expect(value).to.not.be.undefined;
      },
      lessThanOrEqualTo: (field, value) => {
        expect(field).to.not.be.undefined;
        expect(value).to.not.be.undefined;
      },
      exists: (field) => {
        expect(field).to.not.be.undefined;
      },
      notEqualTo: (field, value) => {
        expect(field).to.not.be.undefined;
        expect(value).to.not.be.undefined;
      },
      containsAll: (field, value) => {
        expect(field).to.not.be.undefined;
        expect(value).to.not.be.undefined;
      },
      startsWith: (field, value) => {
        expect(field).to.not.be.undefined;
        expect(value).to.not.be.undefined;
      }
    };
    sinon.spy(parseQueryStub, 'equalTo');
    sinon.spy(parseQueryStub, 'greaterThan');
    sinon.spy(parseQueryStub, 'greaterThanOrEqualTo');
    sinon.spy(parseQueryStub, 'lessThan');
    sinon.spy(parseQueryStub, 'lessThanOrEqualTo');
    sinon.spy(parseQueryStub, 'exists');
    sinon.spy(parseQueryStub, 'notEqualTo');
    sinon.spy(parseQueryStub, 'containsAll');
    sinon.spy(parseQueryStub, 'startsWith');

    it('equal operator', () => {
      dataParse.buildFilter(parseQueryStub, { operator: '=', field: 'equal', value: 'equalValue' });
      expect(parseQueryStub.equalTo.called).to.be.true;
    });

    it('greaterThan operator', () => {
      dataParse.buildFilter(parseQueryStub, {
        operator: '>',
        field: 'greater',
        value: 'greaterValue'
      });
      expect(parseQueryStub.greaterThan.called).to.be.true;
    });

    it('greaterThanOrEqualTo operator', () => {
      dataParse.buildFilter(parseQueryStub, {
        operator: '>=',
        field: 'greaterOrEqual',
        value: 'greaterOrEqualValue'
      });
      expect(parseQueryStub.greaterThanOrEqualTo.called).to.be.true;
    });

    it('lessThan operator', () => {
      dataParse.buildFilter(parseQueryStub, { operator: '<', field: 'less', value: 'lessValue' });
      expect(parseQueryStub.lessThan.called).to.be.true;
    });

    it('lessThanOrEqualTo operator', () => {
      dataParse.buildFilter(parseQueryStub, {
        operator: '<=',
        field: 'lessOrEqual',
        value: 'lessOrEqualValue'
      });
      expect(parseQueryStub.lessThanOrEqualTo.called).to.be.true;
    });

    it('notEqualTo operator', () => {
      dataParse.buildFilter(parseQueryStub, {
        operator: '!=',
        field: 'notEqual',
        value: 'notEqualValue'
      });
      expect(parseQueryStub.notEqualTo.called).to.be.true;
    });

    it('exists operator', () => {
      dataParse.buildFilter(
        parseQueryStub,
        { operator: '!=', field: 'exists', value: undefined }
      );
      expect(parseQueryStub.exists.called).to.be.true;
    });

    it('containsAll operator', () => {
      dataParse.buildFilter(parseQueryStub, {
        operator: 'containsAll',
        field: 'containsAll',
        value: 'containsAllValue'
      });
      expect(parseQueryStub.containsAll.called).to.be.true;
    });

    it('startsWith operator', () => {
      dataParse.buildFilter(parseQueryStub, {
        operator: 'startsWith',
        field: 'startsWith',
        value: 'startsWidthValue'
      });
      expect(parseQueryStub.startsWith.called).to.be.true;
    });

    it('default', () => {
      dataParse.buildFilter(
        parseQueryStub,
        { operator: '', field: 'equal', value: 'equalValue' }
      );
      expect(parseQueryStub.equalTo.called).to.be.true;
    });
  });
  describe('test buildQuery', () => {
    it('test empty query', () => {
      const query = dataParse.buildQuery('Test');
      expect(query).to.not.be.undefined;
    });
    it('test orders and includes', () => {
      const addAscending = sinon.stub(Parse.Query.prototype, 'addAscending');
      const addDescending = sinon.stub(Parse.Query.prototype, 'addDescending');
      const include = sinon.stub(Parse.Query.prototype, 'include');

      const testQuery = {
        orders: [{
          ascending: true,
          field: 'TestAscending'
        }, {
          ascending: false,
          field: 'TestDescending'
        }],
        includes: ['Test']
      };
      dataParse.buildQuery('Test', testQuery);

      addAscending.restore();
      addDescending.restore();
      include.restore();
      expect(addAscending.called).to.be.true;
      expect(addDescending.called).to.be.true;
      expect(include.called).to.be.true;
    });
    it('test filters and includes', () => {
      const buildFilterStub = sinon.stub(dataParse, 'buildFilter');
      const testQuery = {
        filters: [{
          type: 'and',
          operator: '=',
          field: 'test',
          value: 'test value'
        }]
      };
      dataParse.buildQuery('Test', testQuery);
      buildFilterStub.restore();
      expect(buildFilterStub.called).to.be.true;
      expect(buildFilterStub.firstCall.args[1].type).to.be.equal('and');
      expect(buildFilterStub.firstCall.args[1].operator).to.be.equal('=');
      expect(buildFilterStub.firstCall.args[1].field).to.be.equal('test');
      expect(buildFilterStub.firstCall.args[1].value).to.be.equal('test value');
    });
    it('test or filters', () => {
      const buildFilterStub = sinon.stub(dataParse, 'buildFilter');
      const or = sinon.stub(Parse.Query, 'or');
      const testQuery = {
        filters: [{
          type: 'or',
          operator: '=',
          field: 'test',
          value: 'test value'
        }, {
          type: 'or',
          operator: '=',
          field: 'test1',
          value: 'test1 value'
        }]
      };
      dataParse.buildQuery('Test', testQuery);
      buildFilterStub.restore();
      or.restore();
      expect(buildFilterStub.callCount).to.be.equal(2);
      expect(buildFilterStub.firstCall.args[1].type).to.be.equal('or');
      expect(buildFilterStub.firstCall.args[1].operator).to.be.equal('=');
      expect(buildFilterStub.firstCall.args[1].field).to.be.equal('test');
      expect(buildFilterStub.firstCall.args[1].value).to.be.equal('test value');
      expect(buildFilterStub.secondCall.args[1].type).to.be.equal('or');
      expect(buildFilterStub.secondCall.args[1].operator).to.be.equal('=');
      expect(buildFilterStub.secondCall.args[1].field).to.be.equal('test1');
      expect(buildFilterStub.secondCall.args[1].value).to.be.equal('test1 value');
      expect(or.called).to.be.true;
      expect(or.firstCall.args.length).to.be.equal(2);
    });
  });
  describe('test updateFields', () => {
    const testObjectStub = {
      set: (field, value) => {
        expect(field).to.not.be.undefined;
        expect(value).to.not.be.undefined;
      },
      increment: (field) => {
        expect(field).to.not.be.undefined;
      },
      add: (field, value) => {
        expect(field).to.not.be.undefined;
        expect(value).to.not.be.undefined;
      },
      addUnique: (field, value) => {
        expect(field).to.not.be.undefined;
        expect(value).to.not.be.undefined;
      },
      unset: (field) => {
        expect(field).to.not.be.undefined;
      },
      remove: (field) => {
        expect(field).to.not.be.undefined;
      }
    };

    it('test set', () => {
      const updatedFields = {
        updatedFields: [{
          operator: 'set',
          field: 'setField',
          value: 'setValue'
        }]
      };
      const set = sinon.spy(testObjectStub, 'set');
      dataParse.updateFields(testObjectStub, updatedFields);
      set.restore();
      expect(set.called).to.be.true;
    });

    it('test increment', () => {
      const updatedFields = {
        updatedFields: [{
          operator: 'increment',
          field: 'incrementField'
        }]
      };
      const increment = sinon.spy(testObjectStub, 'increment');
      dataParse.updateFields(testObjectStub, updatedFields);
      increment.restore();
      expect(increment.called).to.be.true;
    });

    it('test add', () => {
      const updatedFields = {
        updatedFields: [{
          operator: 'add',
          field: 'addField',
          value: 'addValue'
        }]
      };
      const add = sinon.spy(testObjectStub, 'add');
      dataParse.updateFields(testObjectStub, updatedFields);
      add.restore();
      expect(add.called).to.be.true;
    });

    it('test addUnique', () => {
      const updatedFields = {
        updatedFields: [{
          operator: 'addUnique',
          field: 'addUniqueField',
          value: 'addUniqueValue'
        }]
      };
      const addUnique = sinon.spy(testObjectStub, 'addUnique');
      dataParse.updateFields(testObjectStub, updatedFields);
      addUnique.restore();
      expect(addUnique.called).to.be.true;
    });

    it('test unset', () => {
      const updatedFields = {
        updatedFields: [{
          operator: 'unset',
          field: 'setField'
        }]
      };
      const unset = sinon.spy(testObjectStub, 'unset');
      dataParse.updateFields(testObjectStub, updatedFields);
      unset.restore();
      expect(unset.called).to.be.true;
    });

    it('test remove', () => {
      const updatedFields = {
        updatedFields: [{
          operator: 'remove',
          field: 'removeField'
        }]
      };
      const remove = sinon.spy(testObjectStub, 'remove');
      dataParse.updateFields(testObjectStub, updatedFields);
      remove.restore();
      expect(remove.called).to.be.true;
    });

    it('test default', () => {
      const updatedFields = {
        updatedFields: [{
          operator: '',
          field: 'setField',
          value: 'setValue'
        }]
      };
      const set = sinon.spy(testObjectStub, 'set');
      dataParse.updateFields(testObjectStub, updatedFields);
      set.restore();
      expect(set.called).to.be.true;
    });
  });
  describe('test buildACL', () => {
    it('test empty ACL', () => {
      const parseACL = dataParse.buildACL();
      expect(parseACL).to.be.undefined;
    });

    it('test not empty ACL with current user', () => {
      const acl = {
        currentUser: true
      };
      const parseACL = dataParse.buildACL({ acl });
      expect(parseACL.permissionsById).to.not.be.undefined;
    });

    it('test not empty ACL without current user', () => {
      const acl = {
        currentUser: false
      };
      const parseACL = dataParse.buildACL({ acl });
      expect(parseACL.permissionsById).to.not.be.undefined;
    });

    it('test setPublicReadAccess', () => {
      const setPublicReadAccess = sinon.stub(Parse.ACL.prototype, 'setPublicReadAccess');
      const acl = {
        allowPublicRead: true
      };
      dataParse.buildACL({ acl });
      setPublicReadAccess.restore();
      expect(setPublicReadAccess.called).to.be.true;
      expect(setPublicReadAccess.firstCall.args[0]).to.be.true;
    });

    it('test setPublicWriteAccess', () => {
      const setPublicWriteAccess = sinon.stub(Parse.ACL.prototype, 'setPublicWriteAccess');
      const acl = {
        allowPublicWrite: true
      };
      dataParse.buildACL({ acl });
      setPublicWriteAccess.restore();
      expect(setPublicWriteAccess.called).to.be.true;
      expect(setPublicWriteAccess.firstCall.args[0]).to.be.true;
    });

    it('test setRoleReadWriteAccess', () => {
      const setRoleReadAccess = sinon.stub(Parse.ACL.prototype, 'setRoleReadAccess');
      const setRoleWriteAccess = sinon.stub(Parse.ACL.prototype, 'setRoleWriteAccess');
      const acl = {
        permissions: [{
          isRole: true,
          role: 'TestRole',
          allowRead: true,
          allowWrite: true
        }]
      };
      dataParse.buildACL({ acl });
      setRoleReadAccess.restore();
      setRoleWriteAccess.restore();
      expect(setRoleReadAccess.called).to.be.true;
      expect(setRoleReadAccess.firstCall.args[0]).to.be.equal('TestRole');
      expect(setRoleReadAccess.firstCall.args[1]).to.be.true;
      expect(setRoleWriteAccess.called).to.be.true;
      expect(setRoleWriteAccess.firstCall.args[0]).to.be.equal('TestRole');
      expect(setRoleWriteAccess.firstCall.args[1]).to.be.true;
    });

    it('test setReadWriteAccess', () => {
      const setReadAccess = sinon.stub(Parse.ACL.prototype, 'setReadAccess');
      const setWriteAccess = sinon.stub(Parse.ACL.prototype, 'setWriteAccess');
      const acl = {
        permissions: [{
          isRole: false,
          id: 'TestUser',
          allowRead: true,
          allowWrite: true
        }]
      };
      dataParse.buildACL({ acl });
      setReadAccess.restore();
      setWriteAccess.restore();
      expect(setReadAccess.called).to.be.true;
      expect(setReadAccess.firstCall.args[0]).to.be.equal('TestUser');
      expect(setReadAccess.firstCall.args[1]).to.be.true;
      expect(setWriteAccess.called).to.be.true;
      expect(setWriteAccess.firstCall.args[0]).to.be.equal('TestUser');
      expect(setWriteAccess.firstCall.args[1]).to.be.true;
    });
  });
  describe('test initialize', () => {
    it('test initialize', () => {
      const initialize = sinon.stub(Parse, 'initialize');
      dataParse.initialize('testApplicationId', 'testServerURL');
      initialize.restore();
      expect(initialize.called).to.be.true;
      expect(initialize.firstCall.args[0]).to.be.equal('testApplicationId');
    });
  });
  describe('test currentUser', () => {
    it('test currentUser', () => {
      const current = sinon.stub(Parse.User, 'current');
      dataParse.currentUser();
      current.restore();
      expect(current.called).to.be.true;
    });
  });
  describe('test login', () => {
    it('test login with logout', () => {
      const current = sinon.stub(Parse.User, 'current', () => (true));
      const logOut = sinon.stub(Parse.User, 'logOut');
      dataParse.login('test', 'test');
      logOut.restore();
      current.restore();

      expect(current.called).to.be.true;
      expect(logOut.called).to.be.true;
    });

    it('test login', () => {
      const current = sinon.stub(Parse.User, 'current', () => (false));
      const login = sinon.stub(Parse.User.prototype, 'logIn');
      dataParse.login('test', 'test')
        .subscribe(
          (u) => {
            expect(u).to.be.equal('successfull user');
          },
          (e) => {
            expect(e.code).to.be.equal(1);
            expect(e.message).to.be.equal('test error');
          },
          () => {

          },
        );
      current.restore();
      login.restore();

      expect(login.called).to.be.true;
      login.firstCall.args[0].success('successfull user');
      login.firstCall.args[0].error(null, { code: 1, message: 'test error' });
    });
  });
  describe('test logout', () => {
    it('test logout', () => {
      const logOut = sinon.stub(Parse.User, 'logOut');
      dataParse.logout()
        .subscribe(
          () => {},
          () => {},
          () => {},
        );
      logOut.restore();
      expect(logOut.called).to.be.true;
    });
  });
  describe('test signUp', () => {
    it('test signUp', () => {
      const set = sinon.stub(Parse.User.prototype, 'set');
      const signUp = sinon.stub(Parse.User.prototype, 'signUp');
      dataParse.signup('test', 'test@easyruta.com', 'test')
        .subscribe(
          (u) => {
            expect(u).to.be.equal('successfull user');
          },
          (e) => {
            expect(e.code).to.be.equal(1);
            expect(e.message).to.be.equal('test error');
          },
          () => {

          },
        );
      set.restore();
      signUp.restore();

      expect(set.callCount).to.be.equal(3);
      expect(set.firstCall.args[0]).to.be.equal('username');
      expect(set.firstCall.args[1]).to.be.equal('test');
      expect(set.secondCall.args[0]).to.be.equal('email');
      expect(set.secondCall.args[1]).to.be.equal('test@easyruta.com');
      expect(set.thirdCall.args[0]).to.be.equal('password');
      expect(set.thirdCall.args[1]).to.be.equal('test');

      expect(signUp.called).to.be.true;
      signUp.firstCall.args[1].success('successfull user');
      signUp.firstCall.args[1].error(null, { code: 1, message: 'test error' });
    });
  });
  describe('test createCollection', () => {
    it('test createCollection', () => {
      function ParseObjectStub() {
        this.testProp = 'Test Prop';
      }
      const extend = sinon.stub(Parse.Object, 'extend', () => (ParseObjectStub));
      const parseObjectStub = dataParse.createCollection('Test');
      extend.restore();
      expect(extend.called).to.be.true;
      expect(parseObjectStub).to.not.be.undefined;
      expect(parseObjectStub.testProp).to.be.equal('Test Prop');
    });
  });
  describe('test count', () => {
    it('test count', () => {
      const queryStub = {
        count: (callback) => {
          callback.success(10);
          callback.error({ code: 1, message: 'test error message' });
        }
      };
      const buildQueryStub = sinon.stub(dataParse, 'buildQuery', () => (queryStub));
      dataParse.count('TestCollection', [])
        .subscribe(
          (c) => {
            expect(c).to.be.equal(10);
          },
          (e) => {
            expect(e.code).to.be.equal(1);
            expect(e.message).to.be.equal('test error message');
          },
          () => {},
        );
      buildQueryStub.restore();
      expect(buildQueryStub.called).to.be.true;
    });
  });
  describe('test getAll', () => {
    it('test getAll', () => {
      const queryStub = {
        find: (callback) => {
          callback.success([{ id: 1 }, { id: 2 }, { id: 3 }]);
          callback.error({ code: 1, message: 'test error message' });
        }
      };
      const buildQueryStub = sinon.stub(dataParse, 'buildQuery', () => (queryStub));
      dataParse.getAll('TestCollection', [])
        .subscribe(
          (a) => {
            expect(a.length).to.be.equal(3);
          },
          (e) => {
            expect(e.code).to.be.equal(1);
            expect(e.message).to.be.equal('test error message');
          },
          () => {},
        );
      buildQueryStub.restore();
      expect(buildQueryStub.called).to.be.true;
    });
  });
  describe('test get', () => {
    it('test get', () => {
      const queryStub = {
        get: (id, callback) => {
          expect(id).to.not.be.undefined;
          callback.success({ id: 1 });
          callback.error({ code: 1, message: 'test error message' });
        }
      };
      const buildQueryStub = sinon.stub(dataParse, 'buildQuery', () => (queryStub));
      dataParse.get('TestCollection', { id: 1 })
        .subscribe(
          (o) => {
            expect(o.id).to.be.equal(1);
          },
          (e) => {
            expect(e.code).to.be.equal(1);
            expect(e.message).to.be.equal('test error message');
          },
          () => {},
        );
      buildQueryStub.restore();
      expect(buildQueryStub.called).to.be.true;
    });
  });
  describe('add', () => {
    it('test add', () => {
      const objectStub = {
        setACL: () => {},
        save: (id, callback) => {
          expect(id).to.be.null;
          callback.success({ id: 1 });
          callback.error(null, { code: 1, message: 'test error message' });
        }
      };
      const buildACLStub = sinon.stub(dataParse, 'buildACL', () => ({}));
      dataParse.add('TestCollection', objectStub, {})
        .subscribe(
          (o) => {
            expect(o.id).to.be.equal(1);
          },
          (e) => {
            expect(e.code).to.be.equal(1);
            expect(e.message).to.be.equal('test error message');
          },
          () => {},
        );
      buildACLStub.restore();
      expect(buildACLStub.called).to.be.true;
    });
  });
  describe('update', () => {
    it('test update', () => {
      const objectStub = {
        setACL: () => {},
        save: (id, callback) => {
          expect(id).to.be.null;
          callback.success({ id: 1 });
          callback.error(null, { code: 1, message: 'test error message' });
        }
      };
      const updateFieldsStub = sinon.stub(dataParse, 'updateFields', () => (objectStub));
      const buildACLStub = sinon.stub(dataParse, 'buildACL', () => ({}));
      dataParse.update('TestCollection', objectStub, { acl: {} })
        .subscribe(
          (o) => {
            expect(o.id).to.be.equal(1);
          },
          (e) => {
            expect(e.code).to.be.equal(1);
            expect(e.message).to.be.equal('test error message');
          },
          () => {},
        );
      updateFieldsStub.restore();
      buildACLStub.restore();
      expect(updateFieldsStub.called).to.be.true;
      expect(buildACLStub.called).to.be.true;
    });
  });
  describe('delete', () => {
    it('test delete', () => {
      const objectStub = {
        destroy: (callback) => {
          callback.success({ id: 1 });
          callback.error(null, { code: 1, message: 'test error message' });
        }
      };
      dataParse.delete('TestCollection', objectStub)
        .subscribe(
          (o) => {
            expect(o.id).to.be.equal(1);
          },
          (e) => {
            expect(e.code).to.be.equal(1);
            expect(e.message).to.be.equal('test error message');
          },
          () => {},
        );
    });
  });
});
