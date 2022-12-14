import { Component, Input, OnChanges, ViewChild } from "@angular/core";
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


@Component({
  selector: "app-destockage-auto-popup",
  templateUrl: "./destockage-auto-popup.component.html",
  styleUrls: ["./destockage-auto-popup.component.scss"]
})
export class DestockageAutoPopupComponent implements OnChanges {

  @Input() ordreId: string;

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

  constructor(
    private stockMouvementsService: StockMouvementsService,
    private authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreDestockageAuto);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
  }

  ngOnChanges() {
    this.setTitle();
  }

  onCellClick(e) {

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
        let DSitems = res.data.fResaAutoOrdre.data.result;
        DSitems.map((item, index) => {
          item.id = index;
          item.statut = item.statut === "O" ? true : false;
        });
        if (this.switchErrors.value) DSitems = DSitems.filter((ds) => ds.warning === "O");
        console.log(this.switchErrors.value, DSitems);
        this.datagrid.dataSource = DSitems;
        setTimeout(() => this.datagrid.instance.endCustomLoading());
      },
      error: (error: Error) => {
        console.log(error);
        alert(this.messageFormat(error.message), this.localizeService.localize("title-destock-auto"));
      }
    });
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("destockage-auto-popup");
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.enableFilters();
  }

  onHidden(e) {
    this.datagrid.dataSource = null;
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
