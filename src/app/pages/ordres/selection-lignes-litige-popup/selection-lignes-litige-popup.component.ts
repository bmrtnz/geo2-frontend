import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent, DxScrollViewComponent, DxDataGridComponent } from "devextreme-angular";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { from, Observable } from "rxjs";
import { alert } from "devextreme/ui/dialog";
import { environment } from "environments/environment";
import { map } from "rxjs/operators";
import Ordre from "app/shared/models/ordre.model";
import notify from "devextreme/ui/notify";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";


@Component({
  selector: "app-selection-lignes-litige-popup",
  templateUrl: "./selection-lignes-litige-popup.component.html",
  styleUrls: ["./selection-lignes-litige-popup.component.scss"]
})
export class SelectionLignesLitigePopupComponent implements OnChanges {

  @Input() ordre: Partial<Ordre>;
  @Output() selectedLignes = new EventEmitter<any>();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  public dataSource: any[];
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public detailedFields: GridColumn[];
  public visible: boolean;
  public title: string;
  public selectedLignesIds: string[];
  public popupFullscreen = false;

  constructor(
    private ordreLignesService: OrdreLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.SelectionLignesCdeLitige);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
  }

  ngOnChanges() {
    this.setTitle();
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Palettes & Colis
      if (e.column.dataField === "ordreLigne.nombrePalettesCommandees") {
        e.cellElement.textContent =
          e.cellElement.textContent +
          "/" +
          e.data.ordreLigne.nombrePalettesExpediees ?? 0;
      }
      if (e.column.dataField === "ordreLigne.nombreColisCommandes") {
        e.cellElement.textContent =
          e.cellElement.textContent +
          "/" +
          e.data.ordreLigne.nombreColisExpedies ?? 0;
      }
    }
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
    }
  }

  onSelectionChanged(e) {
    this.selectedLignesIds = this.datagrid?.instance.getSelectedRowKeys();
  }

  setTitle() {
    if (this.ordre?.id) this.title =
      this.localizeService.localize("title-selection-lignes-cde-litige");
  }

  async enableFilters() {
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField)),
    );

    this.ordreLignesService
      .wLitigePickOrdreOrdligV2(this.ordre.id, await fields.toPromise())
      .subscribe({
        next: (res) => {
          this.dataSource = res.data.wLitigePickOrdreOrdligV2;
          this.datagrid.dataSource = this.dataSource;
        },
        error: (error: Error) => {
          console.log(error);
          notify(error.message.replace("Exception while fetching data (/wLitigePickOrdreOrdligV2) : ", ""), "error", 7000);
        }
      });
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("selection-compte-palox-popup");
  }

  onShown() {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.enableFilters();
  }

  onHidden() {
    this.datagrid.dataSource = null;
  }

  quitPopup() {
    this.popup.visible = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  assignLitige() {

    if (this.selectedLignesIds?.length > 100) {
      alert(this.localizeService.localize("warn-very-big-number-selected"),
        this.localizeService.localize("title-selection-lignes-cde-litige"));
      return;
    }

    this.selectedLignes.emit(this.selectedLignesIds);
    this.quitPopup();
  }

}
