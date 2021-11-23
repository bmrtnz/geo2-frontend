import {
  AsyncRule,
  CompareRule,
  CustomRule, EmailRule,
  NumericRule,
  PatternRule,
  RangeRule,
  RequiredRule,
  StringLengthRule
} from 'devextreme/ui/validation_engine';

declare global {
  interface String {
    ucFirst(): string;
  }
}

String.prototype.ucFirst = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * @see GridBaseColumn
 */
interface GridColumn {

  /**
   * Specifies whether a user can edit values in the column at runtime. By default, inherits the value of the editing.allowUpdating option.
   */
  allowEditing?: boolean;

  /**
   * Specifies whether the header filter can be used to filter data by this column. Applies only if headerFilter.
   * visible is true. By default, inherits the value of the allowFiltering option.
   */
  allowHeaderFiltering?: boolean;

  /**
   * Specifies whether this column can be searched. Applies only if searchPanel.visible is true.
   * Inherits the value of the allowFiltering option by default.
   */
  allowSearch?: boolean;

  /**
   * Specifies a caption for the column.
   */
  caption?: string;

  /**
   * Binds the column to a field of the dataSource.
   */
  dataField?: string;

  /**
   * Casts column values to a specific data type.
   */
  dataType?: 'string' | 'number' | 'date' | 'boolean' | 'object' | 'datetime' ;

  /**
   * Specifies the column's filter value displayed in the filter row.
   */
  filterValue?: any;

  /**
   * Fixes the column.
   */
  fixed?: boolean;

  /**
   * Specifies the widget's edge to which the column is fixed. Applies only if columns[].fixed is true.
   */
  fixedPosition?: string;
  // fixedPosition?: 'left' | 'right';

  /**
   * Formats a value before it is displayed in a column cell.
   */
  format?: format;

  /**
   * Specifies the column's unique identifier. If not set in code, this value is inherited from the dataField.
   */
  name?: string;

  /**
   * Specifies whether the column chooser can contain the column header.
   */
  showInColumnChooser?: boolean;

  /**
   * Specifies the index according to which columns participate in sorting.
   */
  sortIndex?: number;

  /**
   * Specifies the sort order of column values.
   */
  // sortOrder?: 'asc' | 'desc' | undefined;
  sortOrder?: string;

  /**
   * Specifies validation rules to be checked when cell values are updated.
   */
  validationRules?: Array<RequiredRule | NumericRule | RangeRule | StringLengthRule | CustomRule
    | CompareRule | PatternRule | EmailRule | AsyncRule> | {};

  /**
   * Specifies whether the column is visible, that is, occupies space in the table.
   */
  visible?: boolean;

  /**
   * Specifies the position of the column regarding other columns in the resulting widget.
   */
  visibleIndex?: number;

  /**
   * Specifies the column's width in pixels or as a percentage. Ignored if it is less than minWidth.
   */
  width?: number | string;
}

/**
 * Formats values.
 */
// tslint:disable-next-line:max-line-length
type format = 'billions' | 'currency' | 'day' | 'decimal' | 'exponential' | 'fixedPoint' | 'largeNumber' | 'longDate' | 'longTime' | 'millions' | 'millisecond' | 'month' | 'monthAndDay' | 'monthAndYear' | 'percent' | 'quarter' | 'quarterAndYear' | 'shortDate' | 'shortTime' | 'thousands' | 'trillions' | 'year' | 'dayOfWeek' | 'hour' | 'longDateLongTime' | 'minute' | 'second' | 'shortDateShortTime' | string | ((value: number | Date) => string) | { currency?: string, formatter?: ((value: number | Date) => string), parser?: ((value: string) => number | Date), precision?: number, type?: 'billions' | 'currency' | 'day' | 'decimal' | 'exponential' | 'fixedPoint' | 'largeNumber' | 'longDate' | 'longTime' | 'millions' | 'millisecond' | 'month' | 'monthAndDay' | 'monthAndYear' | 'percent' | 'quarter' | 'quarterAndYear' | 'shortDate' | 'shortTime' | 'thousands' | 'trillions' | 'year' | 'dayOfWeek' | 'hour' | 'longDateLongTime' | 'minute' | 'second' | 'shortDateShortTime' };

export const ONE_SECOND = 1000;
export const ONE_MINUTE = ONE_SECOND * 60;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_WEEK = ONE_DAY * 7;

export {GridColumn};
