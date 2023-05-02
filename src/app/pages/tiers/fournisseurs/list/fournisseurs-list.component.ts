import { Component, EventEmitter, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NestedMain } from "app/pages/nested/nested.component";
import { Fournisseur } from "app/shared/models";
import { LocalizationService } from "app/shared/services";
import { ApiService } from "app/shared/services/api.service";
import { FournisseursService } from "app/shared/services/api/fournisseurs.service";
import {
  Grid,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import { Observable, of } from "rxjs";
import { BrowserService } from "../../../../shared/services/browser.service";

@Component({
  selector: "app-fournisseurs-list",
  templateUrl: "./fournisseurs-list.component.html",
  styleUrls: ["./fournisseurs-list.component.scss"],
})
export class FournisseursListComponent implements OnInit, NestedMain {
  readonly gridID = Grid.Fournisseur;

  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  public columns: Observable<GridColumn[]>;

  public gridConfigHandler = (event) =>
    this.gridConfiguratorService.init(this.gridID, {
      ...event,
      onColumnsChange: this.onColumnsChange.bind(this),
    });

  constructor(
    public fournisseursService: FournisseursService,
    public localizeService: LocalizationService,
    private gridConfiguratorService: GridConfiguratorService,
    private router: Router,
    public gridRowStyleService: GridRowStyleService,
    public browserService: BrowserService
  ) {
    this.apiService = this.fournisseursService;
  }

  ngOnInit() {
    this.columns = this.gridConfiguratorService.fetchColumns(this.gridID);
    this.columns.subscribe((columns) => this.updateData(columns));
  }

  private updateData(columns: GridColumn[]) {
    of(columns)
      .pipe(
        GridConfiguratorService.getVisible(),
        GridConfiguratorService.getFields()
      )
      .subscribe((fields) => {
        this.dataGrid.dataSource = this.fournisseursService.getDataSource_v2([
          Fournisseur.getKeyField() as string,
          ...fields,
        ]);
      });
  }

  onColumnsChange({ current }: { current: GridColumn[] }) {
    this.updateData(current);
  }

  onRowDblClick(event) {
    this.router.navigate([`/pages/tiers/fournisseurs/${event.data.id}`]);
  }

  onRowPrepared(e) {
    this.gridRowStyleService.applyGridRowStyle(e);
  }

  onCreate() {
    this.router.navigate([`/pages/tiers/fournisseurs/create`]);
  }
}
