import 'reflect-metadata';
import { from, MonoTypeOperatorFunction, Observable, of, OperatorFunction } from 'rxjs';
import { concatAll, concatMap, endWith, filter, map, mergeMap, reduce, startWith, takeWhile, toArray } from 'rxjs/operators';

export type ModelFieldOptions<T = typeof Model> = {
  model?: Promise<{ default: T }>
  fetchedModel?: T
  asLabel?: boolean
  asKey?: boolean
  details?: Observable<ModelFieldOptions[]>
  [attribute: string]: any
};

/**
 * Describe field
 */
type FieldDescriptor = [string, ModelFieldOptions<typeof Model>];

const DEFAULT_FILTER = /.*/;

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
 * Base abstract class for model definition
 */
export abstract class Model {

  constructor(rawEntity = {}) {
    const fieldsEntries = Object.entries<ModelFieldOptions>(this.constructor.prototype.fields);
    for (const [field, options] of fieldsEntries) {
      if (rawEntity[field] === null || rawEntity[field] === undefined) continue;
      if (options.fetchedModel)
        this[field] = rawEntity[field].length !== undefined ?
          rawEntity[field].map( e => new (options.fetchedModel as any)(e)) :
        new (options.fetchedModel as any)(rawEntity[field]);
      else if (options.dataType && options.dataType === 'date')
        this[field] = new Date(rawEntity[field]).toISOString();
      else
        this[field] = rawEntity[field];
    }
  }

  /**
   * Get model fields as paths list
   * @param depth Sub model selection depth
   * @param filter Regexp field filter
   */
  static getListFields(depth = 1, fieldFilter = DEFAULT_FILTER, prefix?: string):
    Observable<string | string[]> {
    const getFieldName = (property: string) => prefix ? `${prefix}.${property}` : property;
    return from(Object.entries(this.getFields()))
      .pipe(
        this.fetchMapModel(),
        filter(([propertyName, options]) => {
          const path = prefix ? `${prefix}.${propertyName}` : propertyName;
          if (fieldFilter && fieldFilter.test(path)) return true;
          return !options.fetchedModel || (options.fetchedModel && depth > 0);
        }),
        this.takeToLastField(depth),
        concatMap(([propertyName, options]) => {
          const fieldName = getFieldName(propertyName);
          if (!options.fetchedModel) return of(fieldName);
          if (options.fetchedModel && options.fetchedModel.getLabelField())
            return options.fetchedModel.getListFields(depth - 1, fieldFilter, fieldName);
        }),
      );
  }

  /**
   * Get model fields as GraphQL structure
   * @param depth Sub model selection depth
   * @param filter Regexp field filter
   */
  static getGQLFields(depth = 1, fieldFilter = DEFAULT_FILTER, prefix?: string): Observable<string> {
    return from(Object.entries(this.getFields()))
      .pipe(
        this.fetchMapModel(),
        filter(([propertyName, options]) => {
          const path = prefix ? `${prefix}.${propertyName}` : propertyName;
          if (depth > 0 && fieldFilter && fieldFilter.test(path)) return true;
          if (options.fetchedModel && depth > 0) return true;
          return options.asKey || options.asLabel;
        }),
        this.takeToLastField(depth),
        concatMap(([propertyName, options]) => {
          if (!options.fetchedModel) return of(propertyName);
          const path = prefix ? `${prefix}.${propertyName}` : propertyName;
          return options.fetchedModel
            .getGQLFields(depth - 1, fieldFilter, path)
            .pipe(
              map(res => `${res}`),
              startWith(`${propertyName} {`),
              endWith(`}`),
            );
        }),
        reduce((acc, crt) => `${acc} ${crt}`),
      );
  }

  /**
   * Get model detailed fields
   * @param depth Sub model fetch depth
   * @param filter Regexp field filter
   */
  static getDetailedFields(
    depth = 1,
    fieldFilter = DEFAULT_FILTER,
    prefix?: string): Observable<ModelFieldOptions[]> {

    enum DXDataType {
      'String' = 'string',
      'Number' = 'number',
      'Boolean' = 'boolean',
      'Date' = 'date',
      'Object' = 'object',
      'Datetime' = 'datetime',
    }

    return from(Object.entries(this.getFields()))
      .pipe(
        this.fetchMapModel(),
        filter(([name, options]) => depth > 0 || !!options.fetchedModel || fieldFilter.test(name)),
        this.takeToLastField(depth),
        concatMap(([name, options]) => {
          let path = prefix ? `${prefix}.${name}` : name;
          if (options.fetchedModel && depth > 0)
            return options.fetchedModel
              .getDetailedFields(depth - 1, fieldFilter, path)
              .pipe(concatAll());
          const type = Reflect.getMetadata('design:type', this.prototype, name).name;
          if (options.fetchedModel) {
            const descriptor = options.fetchedModel.getLabelField() || options.fetchedModel.getKeyField();
            path = `${path}.${descriptor}`;
          }
          return of({
            name,
            path,
            type,
            dataType: options.dataType || DXDataType[type] || 'string',
            ...options
          }) as Observable<ModelFieldOptions>;
        }),
        toArray(),
      );

  }

  /**
   * Return the field decorated with provided attribute
   * @param attribute Field attribute
   * @param value Attribute value
   */
  private static getFieldsWithAttribute(attribute: string, value?: any): string[] {
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
    return fields.length === 1 ? fields.shift() : fields;
  }

  /**
   * Return the field decorated as label
   */
  static getLabelField() {
    const fields = this.getFieldsWithAttribute('asLabel');
    return fields.length ? fields.shift() : false;
  }

  static getFields(): { [field: string]: ModelFieldOptions } {
    return this.prototype.constructor.prototype.fields;
  }

  /**
   * Fetch and map dynamically imported model
   */
  private static fetchMapModel(): OperatorFunction<FieldDescriptor, FieldDescriptor> {
    return mergeMap(async ([propertyName, options]) => {
      if (options.model) {
        const module = await options.model;
        options.fetchedModel = module.default;
      }
      return [propertyName, options] as FieldDescriptor;
    });
  }

  /**
   * Filter fields containing options
   */
  private static filterWithOptions(): MonoTypeOperatorFunction<FieldDescriptor> {
    return filter(([, options]) => !!options);
  }

  /**
   * Emit values until last field
   * @param currentDepth Current field depth
   */
  private static takeToLastField(currentDepth: number): MonoTypeOperatorFunction<FieldDescriptor> {
    return takeWhile(([propertyName]) => {
      return Object.keys(this.getFields()).pop() !== propertyName || currentDepth > 0;
    }, true);
  }

}
