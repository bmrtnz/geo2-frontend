import 'reflect-metadata';

export type ModelFieldOptions<T = typeof Model> = {
  model?: T
  asLabel?: boolean
  asKey?: boolean
  details?: ModelFieldOptions[]
  [attribute: string]: any
};

const DefaultGridFilter = /(?:^\w?|\.raisonSocial|\.description)$/i;

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

  constructor(rawEntity = {}) {
    const fieldsEntries = Object.entries<ModelFieldOptions>(this.constructor.prototype.fields);
    for (const [field, options] of fieldsEntries) {
      if ( rawEntity[field] === null || rawEntity[field] === undefined ) continue;
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
   * @param depth Sub model fetch depth
   * @param flat Get one level detail
   */
  static getDetailedFields(depth = 1, flat = true, filter = /^(?:raisonSocial|description)$/): ({name: string} & ModelFieldOptions)[] {

    enum DXDataType {
      'String' = 'string',
      'Number' = 'number',
      'Boolean' = 'boolean',
      'Date' = 'date',
      'Object' = 'object',
      'Datetime' = 'datetime',
    }

    const res = Object.entries(this.getFields())
    .filter(([name, options]) => depth > 0 || options.model || filter.test(name))
    .map(([name, options]) => {

      if (options.model && depth > 1)
        options.details = options.model.getDetailedFields(depth - 1, false, filter);
      const type = Reflect.getMetadata('design:type', this.prototype, name).name;
      return {
        name,
        type,
        dataType: options.dataType || DXDataType[type] || 'string',
        ...options
      };

    });

    if (flat) {
      const mapDetails = (fields: ModelFieldOptions[]) => fields
      .map( field => {
        if (field.details) {
          return mapDetails(field.details
          .map( v => ({...v, path: `${field.path || field.name}.${v.name}`})));
        }
        return [{...field, path: field.model ? `${field.path || field.name}.${field.model.getLabelField()}` : field.path || field.name}];
      });
      return mapDetails(res).flat(depth) as any;
    }

    return res;

  }

  /**
   * Return the field decorated with provided attribute
   * @param attribute Field attribute
   * @param value Attribute value
   */
  static getFieldsWithAttribute(attribute: string, value?: any): string[] {
    return Object
    .entries(this.getFields())
    .filter(([, options]) => {

      if (!options) return false;
      if (options[attribute] === undefined) return false;
      return value ? value === options[attribute] : true;

    })
    .map(([propertyName]) => propertyName);
  }

  /**
   * Return the field decorated as key
   */
  static getKeyField() {
    const fields = this.getFieldsWithAttribute('asKey');
    return fields.length === 1 ? fields.shift() : fields ;
  }

  /**
   * Return the field decorated as label
   */
  static getLabelField() {
    const fields = this.getFieldsWithAttribute('asLabel');
    return fields.length ? fields.shift() : false;
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
