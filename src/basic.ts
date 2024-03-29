import { EventEmitter } from "@angular/core";
import { SummaryType } from "app/shared/services/api.service";
import CustomStore from "devextreme/data/custom_store";
import dxDataGrid, {
  dxDataGridColumn,
  dxDataGridRowObject,
} from "devextreme/ui/data_grid";
import {
  AsyncRule,
  CompareRule,
  CustomRule,
  EmailRule,
  NumericRule,
  PatternRule,
  RangeRule,
  RequiredRule,
  StringLengthRule,
} from "devextreme/ui/validation_rules";

declare global {
  interface String {
    ucFirst(): string;
    lcFirst(): string;
  }

  interface Object {
    /**
     * Try to reach value by path
     * @param path path chunks
     */
    reach: (path: string[], context?: {}) => any;
  }
}

String.prototype.ucFirst = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.lcFirst = function () {
  return this.charAt(0).toLowerCase() + this.slice(1);
};

Object.defineProperty(Object.prototype, "reach", {
  value(path: string[], context?: {}) {
    if (context === undefined) context = this;
    return path.length
      ? context?.reach(path, context?.[path.shift()])
      : context;
  },
});

/**
 * @see GridBaseColumn
 */
interface GridColumn {
  /**
   * Specifies whether a user can edit values in the column at runtime.
   * By default, inherits the value of the editing.allowUpdating option.
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
  dataType?: any;

  /**
   * Casts column values to a specific type.
   */
  type?: any;

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
  validationRules?: Array<
    | RequiredRule
    | NumericRule
    | RangeRule
    | StringLengthRule
    | CustomRule
    | CompareRule
    | PatternRule
    | EmailRule
    | AsyncRule
  >;

  /**
   * Specifies whether the column is visible, that is, occupies space in the table.
   */
  visible?: boolean;

  /**
   * Specifies the position of the column regarding other columns in the resulting widget.
   */
  visibleIndex?: number;

  /**
   * Specifies whether HTML tags are displayed as plain text or applied to the values of the column.
   */
  encodeHtml?: boolean;

  /**
   * Specifies the column's width in pixels or as a percentage. Ignored if it is less than minWidth.
   */
  width?: number | string;

  /**
   * Specifies the column's minimum width in pixels or as a percentage.
   */
  minWidth?: number | string;

  /**
   * Specifies the column cell template when required
   */
  cellTemplate?: string;

  /**
   * Specifies the column edit cell template when required
   */
  editCellTemplate?: string;

  /**
   * Specifies the edit format options
   */
  editorOptions?: {};

  /**
   * Specifies the column edit cell template when required
   */
  headerCellTemplate?: string;

  /**
   * Specifies the group row cell template when required
   */
  groupCellTemplate?: string;

  /**
   * Sets custom column values used to group grid records
   */
  calculateGroupValue?: string;

  /**
   * Allow column grouping
   */
  allowGrouping?: boolean;

  /**
   * Specifies a column's class.
   */
  cssClass?: string;

  /**
   * Allow column sorting
   */
  allowSorting?: boolean;

  calculateDisplayValue?: string;

  lookup?: { valueExpr: string; displayExpr: string; dataSource: any };

  calculateSortValue?: string;
  calculateCellValue?: string;
  setCellValue?: string;
  customizeText?: string;
  virtual?: boolean;
  formatter?: string;
  calculateFilterExpression?: any;
}

/**
 * Specify item of the total summary.
 * @link [Devexpress Doc.](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/summary/totalItems/)
 */
export type TotalItem = {
  /**
   * Specifies the alignment of a summary item.
   */
  alignment?: "right" | "center" | "left";

  /**
   * Specifies the column that provides data for a summary item.
   */
  column?: string;

  /**
   * Specifies a CSS class to be applied to a summary item.
   */
  cssClass?: string;

  /**
   * Customizes the text to be displayed in the summary item.
   */
  customizeText?: (itemInfo: {
    value: string | number | Date;
    valueText: string;
  }) => string;

  /**
   * Specifies the summary item's text.
   */
  displayFormat?: string;

  /**
   * Specifies the total summary item's identifier.
   */
  name?: string;

  /**
   * Specifies the column that must hold the summary item.
   */
  showInColumn?: string;

  /**
   * Specifies whether to skip empty strings, null, and undefined values when calculating a summary.
   * Does not apply when you use a remote data source.
   */
  skipEmptyValues?: boolean;

  /**
   * Specifies how to aggregate data for the total summary item.
   */
  summaryType: SummaryType | string;

  /**
   * Specifies a summary item value's display format.
   */
  valueFormat?: format;
};

/**
 * Formats values.
 */
// eslint-disable-next-line max-len
type format =
  | "billions"
  | "currency"
  | "day"
  | "decimal"
  | "exponential"
  | "fixedPoint"
  | "largeNumber"
  | "longDate"
  | "longTime"
  | "millions"
  | "millisecond"
  | "month"
  | "monthAndDay"
  | "monthAndYear"
  | "percent"
  | "quarter"
  | "quarterAndYear"
  | "shortDate"
  | "shortTime"
  | "thousands"
  | "trillions"
  | "year"
  | "dayOfWeek"
  | "hour"
  | "longDateLongTime"
  | "minute"
  | "second"
  | "shortDateShortTime"
  | string
  | ((value: number | Date) => string)
  | {
    currency?: string;
    formatter?: (value: number | Date) => string;
    parser?: (value: string) => number | Date;
    precision?: number;
    type?:
    | "billions"
    | "currency"
    | "day"
    | "decimal"
    | "exponential"
    | "fixedPoint"
    | "largeNumber"
    | "longDate"
    | "longTime"
    | "millions"
    | "millisecond"
    | "month"
    | "monthAndDay"
    | "monthAndYear"
    | "percent"
    | "quarter"
    | "quarterAndYear"
    | "shortDate"
    | "shortTime"
    | "thousands"
    | "trillions"
    | "year"
    | "dayOfWeek"
    | "hour"
    | "longDateLongTime"
    | "minute"
    | "second"
    | "shortDateShortTime";
  };

export const ONE_SECOND = 1000;
export const ONE_MINUTE = ONE_SECOND * 60;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_WEEK = ONE_DAY * 7;

export { GridColumn };

/**
 * Interface defining single item selection from a list
 */
export interface SingleSelection<I> {
  getSelectedItem: () => Partial<I>;
  selectionChanged?: EventEmitter<Partial<I>>;
}

export class Change<T> {
  type: "insert" | "update" | "remove";

  key: any;

  data: T;
}

export type OnSavingEvent = {
  cancel: boolean;
  changes: Array<any>;
  component: dxDataGrid;
  element: HTMLElement;
  promise: Promise<void>;
};

export type CellTemplate = {
  column: dxDataGridColumn;
  columnIndex: number;
  component: dxDataGrid;
  data: Record<string, any>;
  displayValue: any;
  oldValue: any;
  row: dxDataGridRowObject;
  rowIndex: number;
  rowType: string;
  text: string;
  value: any;
  watch: (getter, handler) => void;
};

export type LookupStore = {
  store: CustomStore;
  [key: string]: any;
};
