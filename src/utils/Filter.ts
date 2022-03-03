// tslint:disable semicolon

// Api::Filter
type LogicalOperator = "and" | "or";
type FilterChunk =
    | [LogicalOperator]
    | [
          string,
          (
              | "="
              | ">"
              | ">="
              | "<"
              | "<="
              | "contains"
              | "in"
              | "startswith"
              | "endswith"
              | "notcontains"
              | "isnull"
              | "isnotnull"
              | "<>"
          ),
          any,
      ];

declare global {
    interface Function {
        with(...args): any;
    }
}

Function.prototype.with = function (...args) {
    return this.bind(null, ...args);
};

export const pipe = (...fns) => fns.reduce((v, f) => f(v), fns.shift()());

export const Api = {
    Filter: {
        Chunk: {
            hasValue: (chunk: FilterChunk) => chunk.length !== 3 || !!chunk[2],
        },

        Pair: {
            addComparaison: (
                r:
                    | "="
                    | ">"
                    | ">="
                    | "<"
                    | "<="
                    | "contains"
                    | "in"
                    | "startswith"
                    | "endswith"
                    | "notcontains"
                    | "isnull"
                    | "isnotnull"
                    | "<>",
                [k, v]: [string, any],
            ) => [k, r, v],
        },

        create: (): FilterChunk[] => [],
        merge: (chunk: FilterChunk, filter: FilterChunk[]) => [
            ...filter,
            chunk,
        ],
        andMerge: (chunk: FilterChunk, filter: FilterChunk[]) => [
            ...filter,
            "and",
            chunk,
        ],
        mergeIf: (
            condition: () => boolean,
            chunk: FilterChunk,
            filter: FilterChunk[],
        ) => (condition() ? [...filter, chunk] : filter),
        mergeIfValue: (chunk: FilterChunk, filter: FilterChunk[]) =>
            Api.Filter.Chunk.hasValue(chunk) ? [...filter, chunk] : filter,
        andMergeIfValue: (chunk: FilterChunk, filter: FilterChunk[]) =>
            Api.Filter.Chunk.hasValue(chunk)
                ? [...filter, "and", chunk]
                : filter,
    },
};

export default { Api, pipe };
