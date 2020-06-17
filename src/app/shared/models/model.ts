export type ModelFieldOptions<T = typeof Model> = {
  model?: T
  asLabel?: boolean
  asKey?: boolean
  [attribute: string]: any
};

const DefaultGridFilter = /(?:^\w+|raisonSocial|description)$/i;

/**
 * Field property decorator
 * @param options Field definition options
 */
export const Field = (options: ModelFieldOptions = {}) => (target: any, key: string | symbol) => {

  Object.defineProperty(target, 'fields', {
    value: {
      ...target.fields,
      [key]: options,
    },
    writable: true,
  });

};

/**
 * Base abstract class for model interaction
 */
export abstract class Model {

  constructor(rawEntity) {
    const fieldsEntries = Object.entries<ModelFieldOptions>(this.constructor.prototype.fields);
    for (const [field, options] of fieldsEntries) {
      if ( !rawEntity[field] ) continue;
      if (options.model)
        this[field] = new (options.model as any)(rawEntity[field]);
      else
        this[field] = rawEntity[field];
    }
  }

  /**
   * Get model fields as list
   */
  static getListFields(depth = 1, filter = DefaultGridFilter, prefix?: string) {
    const getFieldName = (property: string) => prefix ? `${prefix}.${property}` : property;
    return Object.entries(this.getFields())
    .filter(([propertyName, options]) => {

      if (!options) return false;

      const fieldName = getFieldName(propertyName);
      if (!options.model && filter && !filter.test(fieldName)) return false;

      return !options.model || (options.model && depth > 0);
    })
    .map(([propertyName, options]) => {

      const fieldName = getFieldName(propertyName);
      if (!options.model) return fieldName;

      const type: typeof Model = options.model;
      if (type && type.getLabelField())
        return type.getListFields(depth - 1, filter, fieldName);

    })
    .filter( field => field !== undefined )
    .flat();
  }

  /**
   * Get model fields as GraphQL list
   * @param depth Sub model selection depth
   * @param filter Regexp field filter
   */
  static getGQLFields(depth = 1, filter?: RegExp) {
    return Object.keys(this.getFields())
    .filter( propertyName => {

      const options = this.getFields()[propertyName];
      if (!options) return false;

      if (!options.model && filter && !filter.test(`${this.name}.${propertyName}`)) return false;

      return !options.model || (options.model && depth > 0);

    })
    .map( propertyName => {

      const {model} = this.getFields()[propertyName];
      if (!model) return propertyName;

      const type: typeof Model = model;
      return `${propertyName} {\n${type.getGQLFields(depth - 1, filter)}\n}`;

    })
    .join('\n');
  }

  /**
   * Get model detailed fields
   */
  static getDetailedFields(): ({name: string} & ModelFieldOptions)[] {
    return Object.entries(this.getFields())
    .map(([name, options]) => ({ name, ...options}));
  }

  /**
   * Return the field decorated with attribute
   * @param attribute Field attribute
   * @param value Attribute value
   */
  static getFieldWithAttribute(attribute: string, value?: any) {
    const withAttributes = Object.entries(this.getFields())
    .filter(([, options]) => {

      if (!options) return false;
      if (options.model) return false;
      if (options[attribute] === undefined) return false;
      return value ? value === options[attribute] : true;

    })
    .map(([propertyName]) => propertyName);

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
    const options = this.getFields()[fieldName];
    return options && !options.model && (options[attribute] !== undefined && value ? value === options[attribute] : true);
  }

  static getFields(): {[field: string]: ModelFieldOptions} {
    return this.prototype.constructor.prototype.fields;
  }

}
