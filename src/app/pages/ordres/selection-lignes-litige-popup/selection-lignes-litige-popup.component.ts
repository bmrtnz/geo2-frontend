import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import Ordre from "app/shared/models/ordre.model";
import { AuthService, LocalizationService } from "app/shared/services";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import { LitigesService } from "app/shared/services/api/litiges.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { GridColumn } from "basic";
import {
  DxDataGridComponent,
  DxPopupComponent,
  DxScrollViewComponent,
} from "devextreme-angular";
import { alert } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { EMPTY, from, iif, Observable } from "rxjs";
import { concatMap, map } from "rxjs/operators";

let self;

@Component({
  selector: "app-selection-lignes-litige-popup",
  templateUrl: "./selection-lignes-litige-popup.component.html",
  styleUrls: ["./selection-lignes-litige-popup.component.scss"],
})
export class SelectionLignesLitigePopupComponent implements OnChanges {
  @Input() ordre: Partial<Ordre>;
  @Input() litigeID: Litige["id"];
  @Input() lot: [Litige["id"], LitigeLigne["numeroGroupementLitige"]];
  @Input() tempRowsCleaning = true;
  @Output() selectedLignes = new EventEmitter<any>();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false })
  dxScrollView: DxScrollViewComponent;

  public dataSource: any[];
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public detailedFields: GridColumn[];
  public visible: boolean;
  public title: string;
  public selectedLignesIds: string[];
  public popupFullscreen = false;
  public buttonText: string;
  public running: boolean;

  constructor(
    private ordreLignesService: OrdreLignesService,
    private litigesService: LitigesService,
    private litigesLignesService: LitigesLignesService,
    public gridUtils: GridUtilsService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    self = this;
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.SelectionLignesCdeLitige
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
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
    if (e.component.totalCount() === 1 && e.rowType === "data")
      e.rowElement.classList.add("cursor-pointer");
  }

  onRowDblClick(e) {
    if (e.component.totalCount() !== 1) return;
    this.selectedLignesIds = [e.key];
    this.assignLitige();
  }

  calculatePoidsNetExpedie(data) {
    // Ajout type colis
    if (data?.ordreLigne?.poidsNetExpedie)
      return self.gridUtils.numberWithSpaces(data.ordreLigne.poidsNetExpedie) + " " + self.localizeService.localize("kilos");
  }

  calculateVentePrixUnitaire(data) {
    // Ajout type colis
    //+ data.ordre.devise
    if (data?.ordreLigne?.ventePrixUnitaire)
      return self.gridUtils.numberWithSpaces(data.ordreLigne.ventePrixUnitaire) +
        " " + data.ordreLigne.ordre.devise.id + "/" + data.ordreLigne.venteUnite.id;
  }

  calculateAchatDevisePrixUnitaire(data) {
    // Ajout type colis
    if (data?.ordreLigne?.achatDevisePrixUnitaire)
      return self.gridUtils.numberWithSpaces(data.ordreLigne.achatDevisePrixUnitaire) +
        " " + data.ordreLigne.achatDevise + "/" + data.ordreLigne.achatUnite.id;
  }

  onSelectionChanged() {
    this.selectedLignesIds = this.datagrid?.instance.getSelectedRowKeys();
    this.buttonText = this.localizeService.localize(
      "btn-assign-ligne" + (this.selectedLignesIds?.length > 1 ? "s" : "")
    );
  }

  setTitle() {
    if (this.ordre?.id)
      this.title = this.localizeService.localize(
        "title-selection-lignes-cde-litige"
      );
    this.onSelectionChanged();
  }

  async enableFilters() {
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );

    this.ordreLignesService
      .wLitigePickOrdreOrdligV2(this.ordre.id, await fields.toPromise())
      .subscribe({
        next: (res) => {
          this.dataSource = res.data.wLitigePickOrdreOrdligV2;
          this.datagrid.dataSource = this.dataSource;
          setTimeout(() => {
            if (this.datagrid.instance.totalCount() === 1)
              this.datagrid.instance.selectAll();
          }, 100); // Small waiting time for Dx
        },
        error: (error: Error) => {
          console.log(error);
          notify(
            error.message.replace(
              "Exception while fetching data (/wLitigePickOrdreOrdligV2) : ",
              ""
            ),
            "error",
            7000
          );
        },
      });
  }

  onShowing(e) {
    e.component
      .content()
      .parentNode.classList.add("selection-lignes-cde-litige-popup");
    // Clear temps litige lignes
    if (this.tempRowsCleaning)
      this.litigesLignesService
        .getList(
          `litige.id==${this.litigeID} and numeroGroupementLitige=isnull=null and valide==false`,
          ["id"]
        )
        .pipe(
          map((res) => res.data.allLitigeLigneList.map((ligne) => ligne.id)),
          concatMap((ids) => this.litigesLignesService.deleteAll(ids))
        )
        .subscribe();
  }

  onShown() {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.selectedLignesIds = [];
    this.enableFilters();
  }

  onHidden() {
    this.datagrid.dataSource = null;
    this.running = false;
  }

  quitPopup() {
    this.popup.visible = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  assignLitige() {
    if (this.selectedLignesIds?.length > 100) {
      alert(
        this.localizeService.localize("warn-very-big-number-selected"),
        this.localizeService.localize("title-selection-lignes-cde-litige")
      );
      return;
    }

    this.running = true;
    this.litigesService
      .getOne_v2(this.litigeID, new Set(["numeroVersion"]))
      .pipe(
        concatMap((res) =>
          iif(
            () => res.data.litige.numeroVersion === 2,
            this.litigesService.ofInitLigneLitige(
              this.selectedLignesIds.join(),
              this.litigeID,
              this.lot?.[1] ?? ""
            ),
            EMPTY
          )
        )
      )
      .subscribe((res) => {
        this.selectedLignes.emit(this.selectedLignesIds);
        this.quitPopup();
      });
  }
}
