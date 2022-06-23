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

  /** Extract display value from cell */
  public fetchDisplayValueByID(cell: CellTemplate) {
    cell.column.calculateDisplayValue = (data) => {
      console.log(data);
      return "[DATA]";
    };
    // const { dataSource, displayExpression: expr } = this.getSettings(cell.column.dataField);
    // dataSource.filter(["id", "=", cell.value]);
    // const [result] = await dataSource.load();
    // console.log(result, typeof expr === "function" ? expr() : expr);
    // return result[typeof expr === "function" ? expr() : expr];
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
