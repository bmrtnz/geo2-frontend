import {
  Component,
  EventEmitter,
  NgModule,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Entrepot } from "app/shared/models";
import { AuthService } from "app/shared/services";
import { MruEntrepotsService } from "app/shared/services/api/mru-entrepots.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn, SingleSelection } from "basic";
import { DxButtonModule, DxDataGridComponent, DxDataGridModule } from "devextreme-angular";
import { confirm } from "devextreme/ui/dialog";
import { Observable, of } from "rxjs";
import { TabContext } from "../../../pages/ordres/root/root.component";
import { map } from "rxjs/operators";
import MRUEntrepot from "app/shared/models/mru-entrepot.model";
import { DateManagementService } from "app/shared/services/date-management.service";
import notify from "devextreme/ui/notify";
import DataSource from "devextreme/data/data_source";
import { CommonModule } from "@angular/common";
import { SharedModule } from "app/shared/shared.module";

@Component({
  selector: "app-grid-historique-entrepots",
  templateUrl: "./grid-historique-entrepots.component.html",
  styleUrls: ["./grid-historique-entrepots.component.scss"],
})
export class GridHistoriqueEntrepotsComponent
  implements OnInit, SingleSelection<MRUEntrepot>
{
  readonly gridID = Grid.OrdreHistoriqueEntrepot;

  @Output() public pulseButton = new EventEmitter();
  @Output() public hideCreateButton = new EventEmitter();
  @Output() public createOrder = new EventEmitter();

  @ViewChild(DxDataGridComponent, { static: false })
  public grid: DxDataGridComponent;

  public columns: Observable<GridColumn[]>;
  public gridConfigHandler = (event) =>
    this.gridConfiguratorService.init(this.gridID, {
      ...event,
      title: "Liste des entrepôts",
      onColumnsChange: this.onColumnsChange.bind(this),
    });

  constructor(
    public mruEntrepotsService: MruEntrepotsService,
    public authService: AuthService,
    private dateManagementService: DateManagementService,
    public gridConfiguratorService: GridConfiguratorService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public tabContext: TabContext
  ) { }

  ngOnInit() {
    this.columns = this.gridConfiguratorService.fetchColumns(this.gridID);
    this.columns.subscribe((columns) => this.updateData(columns));
  }

  onColumnsChange({ current }: { current: GridColumn[] }) {
    this.updateData(current);
  }

  private updateData(columns: GridColumn[]) {
    of(columns)
      .pipe(
        GridConfiguratorService.getVisible(),
        GridConfiguratorService.getFields(),
        map((fields) =>
          this.mruEntrepotsService.getDataSource_v2([
            `entrepot.${Entrepot.getKeyField()}`,
            `entrepot.${Entrepot.getLabelField()}`,
            ...fields,
          ])
        )
      )
      .subscribe((datasource) => {
        const filters = this.buildFilters();
        datasource.filter(filters);
        this.grid.dataSource = datasource;
      });
  }

  buildFilters() {
    return [
      ["societe.id", "=", this.currentCompanyService.getCompany().id],
      "and",
      ["entrepot.valide", "=", true],
      "and",
      ["entrepot.client.valide", "=", true],
      "and",
      // We show only the year history
      [
        "dateModification",
        ">=",
        new Date(this.dateManagementService.findDate(-365)),
      ],
      "and",
      [
        "utilisateur.nomUtilisateur",
        "=",
        this.authService.currentUser.nomUtilisateur,
      ],
    ]
  }

  public reload() {
    (this.grid.dataSource as DataSource).filter(this.buildFilters());
    this.grid.instance.refresh();
  }

  getSelectedItem() {
    return this.grid.instance
      .getVisibleRows()
      .filter((row) => row.key === this.grid.focusedRowKey)
      .map((row) => row.data)[0] as Partial<MRUEntrepot>;
  }

  onFocusedRowChanged(e) {
    this.pulseButton.emit();
  }

  onRowPrepared(e) {
    if (e.rowType === "data") e.rowElement.classList.add("cursor-pointer");
  }

  onSelectionChanged(e) {
    // To hide create button when more than one entrepot selected
    const selected = e.component.getSelectedRowKeys();
    this.hideCreateButton.emit(selected?.length > 1);
    if (selected.length === 1) {
      e.component.option(
        "focusedRowIndex",
        e.component.getRowIndexByKey(selected[0])
      );
    }
  }

  deleteItem() {
    this.grid?.instance.getSelectedRowsData().map((data) => {
      this.mruEntrepotsService.deleteOne(data.entrepot.id).subscribe({
        next: async (res) => {
          notify(this.localizeService.localize("delete-done"), "success", 2000);
          this.refreshGrid();
        },
        error: (err) => {
          console.log(err);
          notify(this.localizeService.localize("delete-error"), "error", 2000);
        },
      });
    });
  }

  async deleteAllItems() {
    if (
      await confirm(
        this.localizeService.localize("text-popup-supprimer-favoris"),
        this.localizeService.localize("text-popup-title-favoris")
      )
    ) {
      this.mruEntrepotsService.deleteAll().subscribe({
        next: (res) => {
          notify(this.localizeService.localize("delete-done"), "success", 2000);
          this.refreshGrid();
        },
        error: (err) => {
          console.log(err);
          notify(this.localizeService.localize("delete-error"), "error", 2000);
        },
      });
    }
  }

  refreshGrid() {
    this.grid.instance.refresh();
    this.grid.instance.clearSelection();
  }
}

@NgModule({
  declarations: [GridHistoriqueEntrepotsComponent],
  exports: [GridHistoriqueEntrepotsComponent],
  imports: [
    CommonModule,
    SharedModule,
    DxDataGridModule,
    DxButtonModule,
  ],
})
export class GridHistoriqueEntrepotsModule { }
