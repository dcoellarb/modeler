import Rx from 'rx';
import Parse from 'parse';

/**
* class DataParseInstance
* Singleton pattern class
* to provide helper funtions
* to interact with Parse backend
*/
class DataParseInstance {

  constructor() {
    // Private Methods

    /**
    * logError() logs errors to console
    * based on the passed in method and error,
    *
    * @param {String} method
    * @param {Object} error
    */
    this.logError = (method, error) => {
      console.log(`Parse Error: on ${method}`);
      if (error) {
        console.log(`Parse Error: ${error.code} ${error.message}`);
        if (error.code === 209) {
          Parse.User.logOut();
        }
      }
    };

    /**
    * buildFilter() updates the queyr passed in
    * based on the passed in filter configuration,
    *
    * @param {Object} query
    * @param {Object} filter
    * @return {Object} query
    */
    this.buildFilter = (query, filter) => {
      switch (filter.operator) {
        case '=':
          query.equalTo(filter.field, filter.value);
          break;
        case '>':
          query.greaterThan(filter.field, filter.value);
          break;
        case '>=':
          query.greaterThanOrEqualTo(filter.field, filter.value);
          break;
        case '<':
          query.lessThan(filter.field, filter.value);
          break;
        case '<=':
          query.lessThanOrEqualTo(filter.field, filter.value);
          break;
        case '!=':
          if (filter.value === undefined) {
            query.exists(filter.field);
          } else {
            query.notEqualTo(filter.field, filter.value);
          }
          break;
        case 'containsAll':
          query.containsAll(filter.field, filter.value);
          break;
        case 'startsWith':
          query.startsWith(filter.field, filter.value);
          break;
        default:
          query.equalTo(filter.field, filter.value);
          break;
      }
    };

    /**
    * buildQuery() returns ParseQuery
    * based on the passed in collection name,
    * and multiple params
    *
    * @param {String} collection
    * @param {Object} params
    * @return {ParseQuery} query
    */
    this.buildQuery = (collection, params) => {
      const entity = Parse.Object.extend(collection);
      let query;
      if (params) {
        const filters = params.filters;
        const orders = params.orders;
        const includes = params.includes;

        if (filters) {
          const orFilters = filters.filter(filter =>
            filter.type === 'or'
          );
          const andFilters = filters.filter(filter =>
            filter.type === 'and'
          );

          if (orFilters.length > 0 && Array.isArray(orFilters)) {
            const orQueries = [];
            for (const f of orFilters) {
              const q = new Parse.Query(entity);
              this.buildFilter(q, f);
              orQueries.push(q);
            }
            query = Parse.Query.or(...orQueries);
          } else {
            query = new Parse.Query(entity);
          }

          if (andFilters.length > 0 && Array.isArray(andFilters)) {
            for (const f of andFilters) {
              this.buildFilter(query, f);
            }
          }
        } else {
          query = new Parse.Query(entity);
        }

        if (orders) {
          for (const o of orders) {
            if (o.ascending) {
              query.addAscending(o.field);
            } else {
              query.addDescending(o.field);
            }
          }
        }

        if (includes) {
          for (const i of includes) {
            query.include(i);
          }
        }
      } else {
        query = new Parse.Query(entity);
      }

      return query;
    };

    /**
    * updateFields() sets ParseObject fields
    * based on the passed in parseObject,
    * and the fields arrays to update
    *
    * @param {ParseObject} object
    * @param {Object} params
    * @return {ParseObject} object
    */
    this.updateFields = (object, params) => {
      if (params && params.updatedFields) {
        for (const f of params.updatedFields) {
          switch (f.operator) {
            case 'set':
              object.set(f.field, f.value);
              break;
            case 'increment':
              object.increment(f.field);
              break;
            case 'add':
              object.add(f.field, f.value);
              break;
            case 'addUnique':
              object.addUnique(f.field, f.value);
              break;
            case 'remove':
              object.remove(f.field);
              break;
            case 'unset':
              object.unset(f.field);
              break;
            default:
              object.set(f.field, f.value);
              break;
          }
        }
      }
      return object;
    };

    /**
    * buildACL() returns a ACL object
    * based on the passed in acl configurarion
    *
    * @param {Object} params
    * @return {Object} acl
    */
    this.buildACL = (params) => {
      let acl;
      if (params && params.acl) {
        if (params.acl.currentUser) {
          acl = new Parse.ACL(Parse.User.current());
        } else {
          acl = new Parse.ACL();
        }
        if (params.acl.allowPublicRead) {
          acl.setPublicReadAccess(true);
        }
        if (params.acl.allowPublicWrite) {
          acl.setPublicWriteAccess(true);
        }
        if (params.acl.permissions) {
          for (const p of params.acl.permissions) {
            if (p.isRole) {
              acl.setRoleReadAccess(p.role, p.allowRead);
              acl.setRoleWriteAccess(p.role, p.allowWrite);
            } else {
              acl.setReadAccess(p.id, p.allowRead);
              acl.setWriteAccess(p.id, p.allowWrite);
            }
          }
        }
      }
      return acl;
    };
  }

  // Pulbic Methods

  /**
  * initialize() initializes the Parse server
  * based on the passed in applicationId
  * and serverURL
  *
  * @param {String} applicationId
  * @param {String} serverURL
  */
  initialize(applicationId, serverURL) {
    Parse.initialize(applicationId);
    Parse.serverURL = serverURL;
  }

  // Security and context methods

  /**
  * currentUser() returns parse current user
  *
  * @return {ParseUser}
  */
  currentUser() {
    return Parse.User.current();
  }

  /**
  * login() Async login a user in parse
  * based on the passed in collection name,
  *
  * @param {String} username
  * @param {String} password
  * @return {Rx.Observable}
  * @async return {Parse.User} user
  */
  login(username, password) {
    if (Parse.User.current()) {
      Parse.User.logOut();
    }
    return Rx.Observable.create((observer) => {
      Parse.User.logIn(username, password, {
        success: (user) => {
          observer.onNext(user);
          observer.onCompleted();
        },
        error: (user, error) => {
          this.logError('login', error);
          observer.onError(error);
        }
      });

      return () => {};
    });
  }

  /**
  * logout() Async logout current user
  *
  * @return {Rx.Observable}
  */
  logout() {
    return Rx.Observable.create((observer) => {
      Parse.User.logOut();
      observer.onNext();
      observer.onCompleted();

      return () => {};
    });
  }

  /**
  * signup() Async signs up a new user
  * based on the passed in username,
  * email and password
  *
  * @param {String} username
  * @param {String} collection
  * @param {String} collection
  * @return {Rx.Observable}
  * @async return {Parse.User} u
  */
  signup(username, email, password) {
    return Rx.Observable.create((observer) => {
      const user = new Parse.User();
      user.set('username', username);
      user.set('email', email);
      user.set('password', password);
      user.signUp(null, {
        success: (u) => {
          observer.onNext(u);
          observer.onCompleted();
        },
        error: (u, e) => {
          this.logError('login', e);
          observer.onError(e);
        }
      });
      return () => {};
    });
  }

  // utilities

  /**
  * createModel() returns Parse.Object
  * based on the passed in collection name
  *
  * @param {String} collection
  * @return {ParseObject} parseObject
  */
  createCollection(collection) {
    const ParseObject = Parse.Object.extend(collection);
    const parseObject = new ParseObject();
    return parseObject;
  }

  // CRUD methods

  /**
  * count() async returns a count of records
  * from parse server
  * based on the passed in collection name,
  * and query configuration
  *
  * @param {String} collection
  * @param {Object} params
  * @return {Rx.Observable}
  * @async return {Number} count
  */
  count(collection, params) {
    const query = this.buildQuery(collection, params);

    return Rx.Observable.create((observer) => {
      query.count({
        success: (count) => {
          observer.onNext(count);
          observer.onCompleted();
        },
        error: (error) => {
          this.logError('count', error);
          observer.onError(error);
        }
      });

      return () => {};
    });
  }

  /**
  * getAll() async returns an array of ParseObjects
  * from parse server
  * based on the passed in collection name,
  * and query configuration
  *
  * @param {String} collection
  * @param {Object} params
  * @return {Rx.Observable}
  * @async return {[ParseObject]} objects
  */
  getAll(collection, params) {
    const query = this.buildQuery(collection, params);

    return Rx.Observable.create((observer) => {
      query.find({
        success: (objects) => {
          observer.onNext(objects);
          observer.onCompleted();
        },
        error: (error) => {
          this.logError('getAll', error);
          observer.onError(error);
        }
      });

      return () => {};
    });
  }

  /**
  * get() async returns a single ParseObject
  * from parse server
  * based on the passed in collection name,
  * and query configuration
  *
  * @param {String} collection
  * @param {Object} params
  * @return {Rx.Observable}
  * @async return {ParseObject} object
  */
  get(collection, params) {
    const query = this.buildQuery(collection, params);

    return Rx.Observable.create((observer) => {
      query.get(params.id, {
        success: (object) => {
          observer.onNext(object);
          observer.onCompleted();
        },
        error: (error) => {
          this.logError('get', error);
          observer.onError(error);
        }
      });

      return () => {};
    });
  }

  /**
  * add() async adds a single ParseObject
  * to the parse server
  * based on the passed in collection name,
  * parse object and acl configuration,
  * and returns the inserted parse object
  *
  * @param {String} collection
  * @param {ParseObject} object
  * @param {Object} params
  * @return {Rx.Observable}
  * @async return {ParseObject} addedObject
  */
  add(collection, object, params) {
    const acl = this.buildACL(params);
    if (acl) {
      object.setACL(acl);
    }

    return Rx.Observable.create((observer) => {
      object.save(null, {
        success: (addedObject) => {
          observer.onNext(addedObject);
          observer.onCompleted();
        },
        error: (addedObject, error) => {
          this.logError('add', error);
          observer.onError(error);
        }
      });

      return () => {};
    });
  }

  /**
  * add() async updates a single ParseObject
  * in the parse server
  * based on the passed in collection name,
  * parse object and updated fields and acl configurations,
  * and returns the updated parse object
  *
  * @param {String} collection
  * @param {ParseObject} obj
  * @param {Object} params
  * @return {Rx.Observable}
  * @async return {ParseObject} updatedObject
  */
  update(collection, obj, params) {
    const object = this.updateFields(obj, params);
    if (params.acl) {
      const acl = this.buildACL(params);
      object.setACL(acl);
    }

    return Rx.Observable.create((observer) => {
      object.save(null, {
        success: (updatedObject) => {
          observer.onNext(updatedObject);
          observer.onCompleted();
        },
        error: (updatedObject, error) => {
          this.logError('update', error);
          observer.onError(error);
        }
      });

      return () => {};
    });
  }

  /**
  * add() async deletes a single ParseObject
  * in the parse server
  * based on the passed in collection name
  * and parse object,
  * and returns the deleted parse object
  *
  * @param {String} collection
  * @param {ParseObject} object
  * @return {Rx.Observable}
  * @async return {ParseObject} o
  */
  delete(collection, object) {
    return Rx.Observable.create((observer) => {
      object.destroy({
        success: (o) => {
          observer.onNext(o);
          observer.onCompleted();
        },
        error: (o, error) => {
          this.logError('delete', error);
          observer.onError(error);
        }
      });

      return () => {};
    });
  }
}

/**
* DataParse() to be exported
* Implements singleton pattern
* to return only one DataParseInstance
*/
const DataParse = (() => {
  let instance;

  /**
  * createInstance() returns a new DataParseInstace
  *
  * @return {DataParseInstace} object
  */
  const createInstance = () => {
    const object = new DataParseInstance();
    return object;
  };

  return {

    /**
    * getInstance() returns a DataParseInstance
    * based on the instance member
    *
    * @return {Object} model
    */
    getInstance: () => {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

export default DataParse;
