import { CommonModule } from "@angular/common";
import { Component, Input, NgModule, OnInit } from "@angular/core";
import { CellTemplate } from "basic";
import { DxSelectBoxModule, DxTemplateHost, DxTextBoxModule } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";

type ColumnSettings = {
  dataSource: DataSource,
  displayExpression: string | (() => string),
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
  onSelectBoxCellValueChanged(event, cell) {
    if (event.value?.id === event.previousValue?.id) return;
    if (cell.setValue)
      cell.setValue(event.value?.id);
  }

}

@NgModule({
  imports: [
    CommonModule,
    DxTextBoxModule,
    DxSelectBoxModule,
  ],
  providers: [DxTemplateHost],
  declarations: [EntityCellTemplateComponent],
  exports: [EntityCellTemplateComponent]
})
export class EntityCellTemplateModule { }
