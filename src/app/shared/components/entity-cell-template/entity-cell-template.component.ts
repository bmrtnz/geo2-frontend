import { CommonModule } from "@angular/common";
import { Component, Injectable, Input, NgModule, Pipe, PipeTransform } from "@angular/core";
import { CellTemplate } from "basic";
import { DxSelectBoxModule, DxTemplateHost, DxTextBoxModule } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";

type Cell = {
  key: any,
  displayValue: any,
  column: { displayField: string },
};
type ColumnSettings = {
  dataSource: DataSource,
  displayExpression: string,
};
export type ColumnsSettings = Record<string, ColumnSettings>;

@Component({
  selector: "app-entity-cell-template",
  templateUrl: "./entity-cell-template.component.html",
  styleUrls: ["./entity-cell-template.component.scss"]
})
/** Define cell templates for entity input on `DxDataGrids` */
export class EntityCellTemplateComponent {

  /** Per column settings for CellTemplate */
  @Input() public columnsSettings: ColumnsSettings;

  constructor(
    private store: CellDisplayStore,
  ) { }

  /** Get column settings by field name */
  public getSettings(dataField: string): ColumnSettings {
    const [, settings] = Object
      .entries(this.columnsSettings)
      .find(([k]) => k === dataField);
    if (!settings) throw Error(`No settings defined for dataField "${dataField}"`);
    return settings;
  }

  /** Extract entity from cell */
  public extractEntity(cell: CellTemplate) {
    // Get the base of the `dataField` path
    return cell.data[cell.column.dataField.split(".")[0]];
  }

  // Apply select box value to cell
  public onSelectBoxCellValueChanged(event, cell) {
    if (event.value?.id === event.previousValue?.id) return;
    if (cell.setValue) {
      const { displayExpression } = this.getSettings(cell.column.name);
      this.store.set(cell, event.value[displayExpression]);
      cell.setValue(event.value?.id);
    }
  }

}

@Pipe({ name: "cellDisplay" })
export class CellDisplayPipe implements PipeTransform {
  constructor(
    private store: CellDisplayStore,
  ) { }

  transform(cell: Cell) {
    return this.store.get(cell) ?? cell.displayValue;
  }
}

@Injectable()
export class CellDisplayStore {
  private store: Record<string, Record<string, any>> = {};
  public set(cell: Cell, value: any) {
    this.store[cell.key] = { [cell.column.displayField]: value };
  }
  public get(cell: Cell) {
    return this.store[cell.key]?.[cell.column.displayField];
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxTextBoxModule,
    DxSelectBoxModule,
  ],
  providers: [DxTemplateHost, CellDisplayStore],
  declarations: [EntityCellTemplateComponent, CellDisplayPipe],
  exports: [EntityCellTemplateComponent]
})
export class EntityCellTemplateModule { }
