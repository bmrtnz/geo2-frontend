import 'reflect-metadata';

type ModeFieldOptions = {
  model?: typeof Model; // Model class
};

const fieldMetadataKey = Symbol('field');

/**
 * Field property decorator
 * @param options Field definition options
 */
export const Field = (options: ModeFieldOptions = {}) => (target: any, key: string | symbol) => {

  Object.defineProperty(target, key, { get: () => target[key] });
  Reflect.defineMetadata(fieldMetadataKey, options, target, key);

};

/**
 * Base abstract class for model interaction
 */
export abstract class Model {

  /**
   * Get model fields as list
   */
  static getFields() {
    return Object.getOwnPropertyNames(this.prototype)
    .filter( propertyName => Reflect.getMetadata(fieldMetadataKey, this.prototype, propertyName));
  }

  /**
   * Get model fields as GraphQL list
   * @param depth Sub model selection depth
   * @param filter Regexp field filter
   */
  static getGQLFields(depth = 1, filter?: RegExp) {
    return Object.getOwnPropertyNames(this.prototype)
    .filter( propertyName => {

      const options: ModeFieldOptions = Reflect
      .getMetadata(fieldMetadataKey, this.prototype, propertyName);

      if (!options) return false;

      if (!options.model && filter && !filter.test(`${this.name}.${propertyName}`)) return false;

      return !options.model || (options.model && depth > 0);

    })
    .map( propertyName => {

      const { model }: ModeFieldOptions = Reflect
      .getMetadata(fieldMetadataKey, this.prototype, propertyName);

      if (!model) return propertyName;

      const type: typeof Model = model || Reflect.getMetadata('design:type', this.prototype, propertyName);
      return `${propertyName} {\n${type.getGQLFields(depth - 1, filter)}\n}`;

    })
    .join('\n');
  }

  // static getValidatorFields() {}

}
