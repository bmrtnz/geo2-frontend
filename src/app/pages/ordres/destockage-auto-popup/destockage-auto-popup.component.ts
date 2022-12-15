import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { AuthService, LocalizationService } from "app/shared/services";
import { DxPopupComponent, DxScrollViewComponent, DxDataGridComponent, DxSwitchComponent } from "devextreme-angular";
import { confirm, alert } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { from, Observable } from "rxjs";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { map } from "rxjs/operators";
import { StockMouvementsService } from "app/shared/services/api/stock-mouvements.service";
import { GridCommandesComponent } from "../grid-commandes/grid-commandes.component";
import { OrdreLigne } from "app/shared/models";
import { StocksService } from "app/shared/services/api/stocks.service";


@Component({
  selector: "app-destockage-auto-popup",
  templateUrl: "./destockage-auto-popup.component.html",
  styleUrls: ["./destockage-auto-popup.component.scss"]
})
export class DestockageAutoPopupComponent implements OnChanges {

  @Input() ordreId: string;
  @Input() gridCommandes: GridCommandesComponent;
  @Output() updateGridDestockAuto = new EventEmitter();
  @Output() updateGridCde = new EventEmitter();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;
  @ViewChild("switchErrors", { static: false }) switchErrors: DxSwitchComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public detailedFields: GridColumn[];
  public visible: boolean;
  public gridHasData: boolean;
  public popupFullscreen = false;
  public title: string;
  private lignes: Partial<OrdreLigne>[];
  private ordreLigne: any;
  public newDesc: string[];
  private DsItems: any[];

  constructor(
    private stockMouvementsService: StockMouvementsService,
    private authService: AuthService,
    private stocksService: StocksService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreDestockageAuto);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
  }

  ngOnChanges() {
    this.setTitle();
  }

  onRowClick(e) {
    // Retrieve ligne data
    this.ordreLigne = this.lignes.filter(l => l.numero === e.data.orl_lig)[0];
    this.gridCommandes.openDestockagePopup(this.ordreLigne);
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      e.rowElement.classList.add("cursor-pointer");
      e.rowElement.title = this.localizeService.localize("hint-click-modif-destock");
    }

  }

  endLoading() {
    this.datagrid.instance.endCustomLoading();
  }

  setTitle() {
    if (this.ordreId) this.title =
      this.localizeService.localize("title-destockage-auto-popup");
  }

  enableFilters() {
    this.datagrid.instance.beginCustomLoading("");
    this.stockMouvementsService.fResaAutoOrdre(
      this.ordreId,
      this.authService.currentUser.nomUtilisateur
    ).subscribe({
      next: (res) => {
        this.DsItems = res.data.fResaAutoOrdre.data.result;
        this.DsItems.map((item, index) => {
          item.id = index;
          item.statut = item.statut === "O" ? true : false;
          item.warning = item.warning === "O" ? true : false;
        });
        this.applyErrorsFilter();
        setTimeout(() => this.datagrid.instance.endCustomLoading());
      },
      error: (error: Error) => {
        console.log(error);
        alert(this.messageFormat(error.message), this.localizeService.localize("title-destock-auto"));
      }
    });
  }

  applyErrorsFilter(e?) {
    // We check that this change is coming from the user
    if (e && !e.event) return;
    let dataSource = this.DsItems;
    if (this.switchErrors.value) dataSource = dataSource.filter(ds => ds.warning);
    this.datagrid.dataSource = dataSource;
  }

  updateGrid() {
    // On modifie le commentaire sur la ligne de la grid selon l'état du déstockage
    this.stocksService.allLigneReservationList(this.ordreLigne.id).subscribe(res => {
      const info = res?.data?.allLigneReservationList;
      let newDesc = "Attention : déstockage supprimé sur ";
      newDesc += `${this.ordreLigne.fournisseur.code}/${this.ordreLigne.proprietaireMarchandise.code}`;
      newDesc += "Nouveau déstockage à prévoir";
      if (info.length) {
        newDesc = `OK ${info[0].ligneFournisseurCode}/${info[0].proprietaireCode} ${info.length}`;
      }
      this.DsItems.filter(ds => ds.orl_lig === this.ordreLigne.numero)[0].resa_desc = newDesc;
    });
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("destockage-auto-popup");
    this.lignes = (this.gridCommandes.grid.dataSource as DataSource)?.items();
  }

  onShown() {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.enableFilters();
  }

  onHidden() {
    this.switchErrors.value = true;
    this.DsItems = [];
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  quitPopup() {
    this.popup.visible = false;
  }

  private messageFormat(mess) {
    const functionNames =
      [
        "fResaAutoOrdre"
      ];
    functionNames.map(fn => mess = mess.replace(`Exception while fetching data (/${fn}) : `, ""));
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }

}
