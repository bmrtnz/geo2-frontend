import "reflect-metadata";
import {
  from,
  MonoTypeOperatorFunction,
  Observable,
  of,
  OperatorFunction,
} from "rxjs";
import {
  concatAll,
  concatMap,
  filter,
  map,
  mergeMap,
  reduce,
  takeWhile,
  toArray,
} from "rxjs/operators";

export type ModelFieldOptions<T = typeof Model> = {
  model?: Promise<{ default: T }>;
  fetchedModel?: T;
  asLabel?: boolean;
  asKey?: boolean;
  details?: Observable<ModelFieldOptions[]>;
  [attribute: string]: any;
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
export const Field =
  (options: ModelFieldOptions = {}) =>
  (target: any, key: string | symbol) => {
    Object.defineProperty(target, "fields", {
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
  /**
   * It takes a raw entity and assigns it to the model's fields
   * @param rawEntity - The raw entity that is being converted to a model.
   * @param options
   * @param options.deepFetch - Fetch submodels as needed
   */
  constructor(
    rawEntity = {},
    options: { deepFetch: boolean } = { deepFetch: false }
  ) {
    const fieldsEntries = Object.entries<ModelFieldOptions>(
      this.constructor.prototype.fields
    );

    const assignField = (field: string, fieldOptions: ModelFieldOptions) => {
      this[field] =
        rawEntity[field].length !== undefined
          ? rawEntity[field].map(
              (e) => new (fieldOptions.fetchedModel as any)(e)
            )
          : new (fieldOptions.fetchedModel as any)(rawEntity[field]);
    };

    for (let [field, fieldOptions] of fieldsEntries) {
      if (rawEntity[field] === null || rawEntity[field] === undefined) {
        const type = Reflect.getMetadata("design:type", this, field);
        if (type.name !== "String") continue;
      }
      if (options.deepFetch && fieldOptions.model && !fieldOptions.fetchedModel)
        (async () => {
          fieldOptions = await Model.fetchModel(fieldOptions);
          if (fieldOptions.fetchedModel) assignField(field, fieldOptions);
          else this[field] = rawEntity[field];
        })();
      else if (fieldOptions.fetchedModel) assignField(field, fieldOptions);
      else this[field] = rawEntity[field];
    }
  }

  /**
   * Get model fields as paths list
   * @param depth Sub model selection depth
   * @deprecated Use `getDetailedFields()` instead
   */
  static getListFields(
    depth = 1,
    prefix?: string
  ): Observable<string | string[]> {
    const getFieldName = (property: string) =>
      prefix ? `${prefix}.${property}` : property;
    return from(Object.entries(this.getFields())).pipe(
      this.fetchMapModel(),
      this.takeToLastField(depth),
      concatMap(([propertyName, options]) => {
        const fieldName = getFieldName(propertyName);
        return options.fetchedModel
          ? options.fetchedModel.getListFields(depth - 1, fieldName)
          : of(fieldName);
      })
    );
  }

  /**
   * Get model fields as GraphQL structure
   * @param depth Sub model selection depth
   * @param filter Regexp filter, does not filter required fields, like keys or labels
   */
  static getGQLFields(
    depth = 1,
    fieldFilter = DEFAULT_FILTER,
    prefix?: string,
    config?: { noList?: boolean; forceFilter?: boolean }
  ): Observable<string> {
    return from(Object.entries(this.getFields())).pipe(
      this.fetchMapModel(),
      filter(([propertyName, options]) => {
        const path = prefix ? `${prefix}.${propertyName}` : propertyName;

        // Disable requesting list fields
        if (config && config.noList) {
          const type = Reflect.getMetadata(
            "design:type",
            this.prototype,
            propertyName
          );
          if (type && type.name === "Array") return false;
        }

        if (config?.forceFilter && fieldFilter) {
          if (fieldFilter.test(path)) return true;

          return !!options.fetchedModel;
        } else {
          if (depth > 0 && fieldFilter && fieldFilter.test(path)) return true;
          if (options.fetchedModel && depth > 0) return true;

          return options.asKey || options.asLabel;
        }
      }),
      this.takeToLastField(depth),
      concatMap(([propertyName, options]) => {
        if (!options.fetchedModel) return of(propertyName);
        const path = prefix ? `${prefix}.${propertyName}` : propertyName;
        return options.fetchedModel
          .getGQLFields(depth - 1, fieldFilter, path, config)
          .pipe(
            map((res) => {
              if (res !== "") return `${propertyName} {${res}}`;
            })
          );
      }),
      reduce((acc, crt) => `${acc} ${crt}`)
    );
  }

  /**
   * Retourne la représentation graphQL des chaines de caractère passé en paramètre.
   * @param columns Une liste de chaine de caractère.
   * @return string La représentation GraphQL.
   * @example
   * params: "societe.pays.ville", "societe.adresse1"
   * retournera une chaine graphQL :
   * societe {
   *   adresse1
   *   pays {
   *     ville
   *   }
   * }
   */
  static getGQLObservable(
    columns: Array<string> | Set<string> = []
  ): Observable<string> {
    return of(Model.getGQL(columns).toGraphQL());
  }
  static getGQL(columns: Array<string> | Set<string> = []) {
    const obj = new GraphQLObject();

    if (columns instanceof Set) {
      columns = [...columns];
    }

    columns
      .filter((c) => c)
      .sort()
      .forEach((value) => {
        const strings = value.split(".");

        if (strings.length === 1) {
          obj.properties.add(strings[0]);
        } else {
          const val = strings.pop();
          let tmp = obj;
          strings.forEach((v) => {
            if (!tmp.children.has(v)) {
              tmp.children.set(v, new GraphQLObject());
            }
            tmp = tmp.children.get(v);
          });
          tmp.properties.add(val);
        }
      });

    return obj;
  }

  /**
   * Get model detailed fields
   * @param depth Sub model fetch depth
   * @param filter Regexp filter, does not filter required fields
   * @param opt.prefix Prepend string to the field path
   * @param opt.forceFilter Apply filter on required fields too
   */
  static getDetailedFields(
    depth = 1,
    fieldFilter = DEFAULT_FILTER,
    opt?: { forceFilter?: boolean; prefix?: string }
  ): Observable<ModelFieldOptions[]> {
    enum DXDataType {
      "String" = "string",
      "Number" = "number",
      "Boolean" = "boolean",
      "Date" = "date",
      "Object" = "object",
      "Datetime" = "datetime",
    }

    return from(Object.entries(this.getFields())).pipe(
      this.fetchMapModel(),
      filter(([name, options]) => {
        const path = opt?.prefix ? `${opt?.prefix}.${name}` : name;
        if (depth > 0 && fieldFilter && fieldFilter.test(path)) return true;
        if (options.fetchedModel && depth > 0) return true;
        return opt?.forceFilter ? false : options.asKey || options.asLabel;
      }),
      this.takeToLastField(depth),
      concatMap(([name, options]) => {
        let path = opt?.prefix ? `${opt?.prefix}.${name}` : name;
        if (options.fetchedModel && depth > 0)
          return options.fetchedModel
            .getDetailedFields(depth - 1, fieldFilter, {
              ...opt,
              prefix: path,
            })
            .pipe(concatAll());
        const type = Reflect.getMetadata(
          "design:type",
          this.prototype,
          name
        ).name;
        if (options.fetchedModel) {
          const descriptor =
            options.fetchedModel.getLabelField() ||
            options.fetchedModel.getKeyField();
          path = `${path}.${descriptor}`;
        }
        return of({
          name,
          path,
          type,
          dataType: options.dataType || DXDataType[type] || "string",
          ...options,
        }) as Observable<ModelFieldOptions>;
      }),
      toArray()
    );
  }

  /**
   * Return the field decorated with provided attribute
   * @param attribute Field attribute
   * @param value Attribute value
   */
  private static getFieldsWithAttribute(
    attribute: string,
    value?: any
  ): string[] {
    return Object.entries(this.getFields())
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
    const fields = this.getFieldsWithAttribute("asKey");
    return fields.length === 1 ? fields.shift() : fields;
  }

  /**
   * Return the field decorated as label
   */
  static getLabelField() {
    const fields = this.getFieldsWithAttribute("asLabel");
    return fields.length ? fields.shift() : false;
  }

  /**
   * Return the field decorated as custom label
   */
  static getCustomLabelField() {
    const fields = this.getFieldsWithAttribute("asCustomLabel");
    return fields.length ? fields.shift() : false;
  }

  static getFields(): { [field: string]: ModelFieldOptions } {
    return this.prototype.constructor.prototype.fields;
  }

  static getFieldsName(): Set<string> {
    return new Set(Object.keys(this.prototype.constructor.prototype.fields));
  }

  /**
   * Fetch value from context by path
   * @param path attribute path with chunks separated by dots
   * @param context model instance
   */
  static fetchValue(path: string[], context: {}) {
    return context.reach(path);
  }

  /**
   * Fetch and map dynamically imported model
   */
  private static fetchMapModel(): OperatorFunction<
    FieldDescriptor,
    FieldDescriptor
  > {
    return mergeMap(
      async ([fieldName, options]) =>
        [fieldName, await this.fetchModel(options)] as FieldDescriptor
    );
  }

  private static async fetchModel(options: ModelFieldOptions<typeof Model>) {
    if (options.model) {
      const module = await options.model;
      options.fetchedModel = module.default;
    }
    return options;
  }

  /**
   * Emit values until last field
   * @param currentDepth Current field depth
   */
  private static takeToLastField(
    currentDepth: number
  ): MonoTypeOperatorFunction<FieldDescriptor> {
    return takeWhile(([propertyName]) => {
      const isLastProperty =
        Object.keys(this.getFields()).pop() !== propertyName;
      return (currentDepth === 0 && isLastProperty) || currentDepth > 0;
    }, true);
  }
}

/**
 * Model decorator for fix 'name' property when code is minified
 * @param modelName Name of model
 */
export const ModelName = (modelName: string) => {
  return (target: any) => {
    Object.defineProperty(target, "name", {
      value: modelName,
      enumerable: false,
      writable: false,
      configurable: true,
    });
  };
};

class GraphQLObject {
  properties: Set<string>;
  children: Map<string, GraphQLObject>;

  constructor() {
    this.properties = new Set();
    this.children = new Map<string, GraphQLObject>();
  }

  public toGraphQL() {
    let retour = "";
    this.properties.forEach((value) => (retour += `\n${value}`));
    this.children.forEach((child, key) => {
      retour += `\n${key}{${child.toGraphQL()}\n}`;
    });
    return retour;
  }
}
