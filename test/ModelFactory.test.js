/* global define, it, describe */

import { expect } from 'chai';
import sinon from 'sinon';
import Parse from 'parse';
import ModelFactory from './../ModelFactory';
import ParseDataTypes from './../ParseDataTypes';

describe('ModelFactory.js', () => {
  const TestCollection = class {
    constructor() {
      this.definition = [
        {
          name: 'nombre',
          type: ParseDataTypes.String
        },
        {
          name: 'telefono',
          type: ParseDataTypes.String
        },
        {
          name: 'pointer',
          type: ParseDataTypes.Pointer,
          collection: 'TestPointerCollection'
        }
      ];
    }
  };
  const TestPointerCollection = class {
    constructor() {
      this.definition = [
        {
          name: 'nombre',
          type: ParseDataTypes.String
        }
      ];
    }
  };
  const testFactoryMethod = (collection) => {
    if (collection === 'TestCollection') {
      return new TestCollection();
    } else if (collection === 'TestPointerCollection') {
      return new TestPointerCollection();
    }
    return undefined;
  };


  it('test createModel', () => {
    const model = ModelFactory.createModel('TestCollection', testFactoryMethod);
    expect(model.collection).to.be.equal('TestCollection');
  });

  const model = ModelFactory.createModel('TestCollection', testFactoryMethod);
  it('test toJson with object pointer', () => {
    const testCollectionsStub = {
      id: '1',
      get: (field) => {
        if (field === 'nombre') {
          return 'Test';
        }
        if (field === 'pointer') {
          return {
            id: '1',
            get: (f) => {
              if (f === 'nombre') {
                return 'Test Pointer';
              }
              return undefined;
            }
          };
        }
        return undefined;
      }
    };
    model.toJson(testCollectionsStub);
    expect(model.id).to.be.equal('1');
    expect(model.nombre).to.be.equal('Test');
    expect(model.telefono).to.be.undefined;
    expect(model.pointer.id).to.be.equal('1');
    expect(model.pointer.nombre).to.be.equal('Test Pointer');
  });
  it('test toJson with string pointer', () => {
    const testCollectionsStub = {
      id: '1',
      get: (field) => {
        if (field === 'nombre') {
          return 'Test';
        }
        if (field === 'pointer') {
          return '1';
        }
        return undefined;
      }
    };
    model.toJson(testCollectionsStub);
    expect(model.id).to.be.equal('1');
    expect(model.nombre).to.be.equal('Test');
    expect(model.telefono).to.be.undefined;
    expect(model.pointer).to.be.equal('1');
  });

  const ParseObjectStub = class {
    set(field, value) {
      if (field === 'nombre') {
        this.nombre = value;
      }
      if (field === 'pointer') {
        this.pointer = value;
      }
    }

    get(field) {
      if (field === 'nombre') {
        return this.nombre;
      }
      if (field === 'pointer') {
        return this.pointer;
      }
      return undefined;
    }
  };
  it('test fromJson with object', () => {
    const jsonStub = {
      id: '1',
      nombre: 'Test',
      pointer: {
        id: '1',
        nombre: 'Test Pointer',
        object: new ParseObjectStub()
      },
      object: new ParseObjectStub()
    };
    const parseObject = model.fromJson(jsonStub);
    expect(parseObject.get('nombre')).to.be.equal('Test');
    expect(typeof parseObject.get('pointer')).to.be.equal('object');
  });
  it('test fromJson without object', () => {
    const extendStub = sinon.stub(Parse.Object, 'extend', () => (ParseObjectStub));
    const jsonStub = {
      id: '1',
      nombre: 'Test'
    };
    const parseObject = model.fromJson(jsonStub);
    extendStub.restore();
    expect(parseObject.get('nombre')).to.be.equal('Test');
  });
});
