import 'reflect-metadata';

export type ModelFieldOptions = {
  model?: typeof Model;
  asLabel?: boolean;
  asKey?: boolean;
  [attribute: string]: any;
};

const fieldMetadataKey = Symbol('field');

/**
 * Field property decorator
 * @param options Field definition options
 */
export const Field = (options: ModelFieldOptions = {}) => (target: any, key: string | symbol) => {

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
  static getListFields() {
    return Object.getOwnPropertyNames(this.prototype)
    .filter( propertyName => Reflect.getMetadata(fieldMetadataKey, this.prototype, propertyName))
    .map( propertyName => {
      const options: ModelFieldOptions = Reflect.getMetadata(fieldMetadataKey, this.prototype, propertyName);
      if (options.model && options.model.getLabelField())
        return `${propertyName}.${options.model.getLabelField()}`;
      return propertyName;
    });
  }

  /**
   * Get model fields as GraphQL list
   * @param depth Sub model selection depth
   * @param filter Regexp field filter
   */
  static getGQLFields(depth = 1, filter?: RegExp) {
    return Object.getOwnPropertyNames(this.prototype)
    .filter( propertyName => {

      const options: ModelFieldOptions = Reflect
      .getMetadata(fieldMetadataKey, this.prototype, propertyName);

      if (!options) return false;

      if (!options.model && filter && !filter.test(`${this.name}.${propertyName}`)) return false;

      return !options.model || (options.model && depth > 0);

    })
    .map( propertyName => {

      const { model }: ModelFieldOptions = Reflect
      .getMetadata(fieldMetadataKey, this.prototype, propertyName);

      if (!model) return propertyName;

      const type: typeof Model = model || Reflect.getMetadata('design:type', this.prototype, propertyName);
      return `${propertyName} {\n${type.getGQLFields(depth - 1, filter)}\n}`;

    })
    .join('\n');
  }

  /**
   * Get model detailed fields
   */
  static getDetailedFields(): ({name: string} & ModelFieldOptions)[] {
    return Object.getOwnPropertyNames(this.prototype)
    .filter( name => Reflect.getMetadata(fieldMetadataKey, this.prototype, name))
    .map( name => ({ name, ...Reflect.getMetadata(fieldMetadataKey, this.prototype, name)}));
  }

  /**
   * Return the field decorated with attribute
   * @param attribute Field attribute
   * @param value Attribute value
   */
  static getFieldWithAttribute(attribute: string, value?: any) {
    const withAttributes = Object.getOwnPropertyNames(this.prototype)
    .filter( propertyName => {

      const options: ModelFieldOptions = Reflect
      .getMetadata(fieldMetadataKey, this.prototype, propertyName);

      if (!options) return false;
      if (options.model) return false;
      if (options[attribute] === undefined) return false;
      return value ? value === options[attribute] : true;

    });

    return withAttributes.length ? withAttributes.shift() : false;

  }

  /**
   * Return the field decorated as key
   */
  static getKeyField() {
    return this.getFieldWithAttribute('asKey');
  }

  /**
   * Return the field decorated as label
   */
  static getLabelField() {
    return this.getFieldWithAttribute('asLabel') || '';
  }

  /**
   * Check if the field is decorated with attribute
   * @param fieldName Field name
   * @param attribute Field attribute
   * @param value Attribute value
   */
  static withAttribute(fieldName: string, attribute: string, value: any = true) {
    const options: ModelFieldOptions = Reflect
    .getMetadata(fieldMetadataKey, this.prototype, fieldName);
    return options && !options.model && (options[attribute] !== undefined && value ? value === options[attribute] : true);
  }

}
