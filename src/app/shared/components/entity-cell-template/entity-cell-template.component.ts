import { CommonModule } from "@angular/common";
import { Component, Injectable, Input, NgModule, Pipe, PipeTransform } from "@angular/core";
import { Model } from "app/shared/models/model";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { CellTemplate } from "basic";
import { DxSelectBoxModule, DxTemplateHost, DxTextBoxModule } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";

type Cell = {
  key: any,
  displayValue: any,
  column: { name: string },
};
type ColumnSettings = {
  dataSource: DataSource,
  displayExpression: string[],
};
export type ColumnsSettings = Record<string, ColumnSettings>;

@Injectable()
export class CellDisplayStore {
  private store: Record<string, Record<string, any>> = {};
  public set(cell: Cell, value: any) {
    this.store[cell.key] = { [cell.column.name]: value };
  }
  public get(cell: Cell) {
    return this.store[cell.key]?.[cell.column.name];
  }
}

@Component({
  selector: "app-entity-cell-template",
  templateUrl: "./entity-cell-template.component.html",
  styleUrls: ["./entity-cell-template.component.scss"]
})
/** Define cell templates for entity input on `DxDataGrids` */
export class EntityCellTemplateComponent {

  /** Per column settings for CellTemplate */
  @Input() public columnsSettings: ColumnsSettings;
  @Input() public allowMutations: boolean;

  constructor(
    public gridUtilsService: GridUtilsService,
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
    if (!event.value || event.value?.id === event.previousValue?.id) return;
    if (cell.setValue) {
      const { displayExpression } = this.getSettings(cell.column.name);
      const value = displayExpression
        .map(key => Model.fetchValue(key.split(".").splice(1, 1), event.value))
        .join(" - ");
      this.store.set(cell, value);
      cell.setValue(event.value?.id);
    }
    // Info needed in editing mode, not saved yet
    // Don't ask why a timeOut...
    setTimeout(() => {
      if (cell.data?.proprietaireMarchandise) {
        cell.data.proprietaireMarchandise.id = event.value.id;
        cell.data.proprietaireMarchandise.code = event.value.code;
        cell.data.proprietaireMarchandise.listeExpediteurs = event.value.listeExpediteurs;
      }
    });
  }

  displayCodeBefore(data) {
    return data ?
      ((data.code ? data.code : data.id) + " - " + (data.nomUtilisateur ? data.nomUtilisateur :
        (data.raisonSocial ? data.raisonSocial : data.description)))
      : null;
  }

  public onInput(elem) {
    // KEEP THIS !!! See secureTypedValueWithEditGrid() comment
    this.gridUtilsService.secureTypedValueSBWithEditGrid(elem);
  }

  public onFocusIn(elem) {
    // KEEP THIS !!! See secureFocusSBTypedValueWithEditGrid() comment
    this.gridUtilsService.secureFocusSBTypedValueWithEditGrid(elem);
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
