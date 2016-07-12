
import Parse from 'parse';
import ParseDataTypes from './ParseDataTypes';
/* Add imports for all collections here*/

/**
* class ModelFactory
* Factory Method pattern class
* to create a model classes
*/
class ModelFactory {
  /**
  * createModel() returns a new model
  * based on the passed in collection name,
  * Factory method of the class
  *
  * @param {String} collection
  * @return {Object} model
  */
  static createModel(collection, factoryMethod) {
    ModelFactory.factoryMethod = factoryMethod;
    // Create the model
    const model = factoryMethod(collection);

    // Add adicional members and function
    model.collection = collection;
    model.factoryMethod = factoryMethod;

    /**
    * toJson() sets Object properties
    * based on the passed in parse Object
    *
    * @param {ParseObject} parseObject
    */
    model.toJson = (parseObject) => {
      model.id = parseObject.id;
      model.updatedAt = parseObject.updatedAt;
      model.createdAt = parseObject.createdAt;
      for (const field of model.definition) {
        if (field.type === ParseDataTypes.Pointer) {
          const pointerObject = parseObject.get(field.name);
          if (typeof pointerObject === 'object') {
            const pointerModel = ModelFactory.createModel(field.collection, ModelFactory.factoryMethod);
            pointerModel.toJson(pointerObject);
            model[field.name] = pointerModel;
          } else {
            model[field.name] = pointerObject;
          }
        } else {
          model[field.name] = parseObject.get(field.name);
        }
      }
    };

    /**
    * fromJson() returns a Parse Object
    * based on the passed in js object,
    *
    * @param {Object} json
    * @return {ParseObject} parseObject
    */
    model.fromJson = (json) => {
      let parseObject = json.object;
      if (!parseObject) {
        const ParseObject = Parse.Object.extend(this.model);
        parseObject = new ParseObject();
      }
      for (const field of model.definition) {
        if (json[field.name]) {
          if (field.type === ParseDataTypes.Pointer) {
            if (json[field.name].object) {
              parseObject.set(field.name, json[field.name].object);
            }
          } else {
            parseObject.set(field.name, json[field.name]);
          }
        }
      }
      return parseObject;
    };

    return model;
  }
}

export default ModelFactory;
