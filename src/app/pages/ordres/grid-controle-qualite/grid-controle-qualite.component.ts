import { Component, Input, Output, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { CQLignesService } from "app/shared/services/api/cq-lignes.service";
import { GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import * as gridConfig from "assets/configurations/grids.json";
import { GridColumn } from "basic";
import { DxButtonComponent, DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { alert, confirm } from "devextreme/ui/dialog";
import { ToggledGrid } from "../form/form.component";
import { CqPhotosPopupComponent } from "./cq-photos-popup/cq-photos-popup.component";
import { DocumentsNumService } from "app/shared/services/api/documents-num.service";

@Component({
  selector: "app-grid-controle-qualite",
  templateUrl: "./grid-controle-qualite.component.html",
  styleUrls: ["./grid-controle-qualite.component.scss"],
})
export class GridControleQualiteComponent implements ToggledGrid {
  @Input() public ordre: Ordre;
  @Output() public ordreLigne;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  @ViewChild(CqPhotosPopupComponent, { static: true }) photosPopup: CqPhotosPopupComponent;
  @ViewChild("copyPhotosButton", { static: false }) copyPhotosButton: DxButtonComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];
  public gridRowsTotal: number;

  constructor(
    private cqLignesService: CQLignesService,
    public localization: LocalizationService,
    public documentsNumService: DocumentsNumService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService,
  ) {
    this.detailedFields = gridConfig["controle-qualite"].columns;
  }

  enableFilters() {
    if (this?.ordre?.id) {
      this.dataSource = this.cqLignesService.getDataSource_v2(
        this.detailedFields.map((property) => property.dataField),
      );
      this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
      this.dataGrid.dataSource = this.dataSource;
    }
  }

  onCellPrepared(e) {
  }

  onContentReady(e) {
    this.gridRowsTotal = this.dataGrid.instance.getVisibleRows()?.length;
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : (this.dataSource = null);
  }

  showPhotosButton(cell) {
    console.log(cell.data.ordreLigne.id);
    // const dataSource = this.documentsNumService.count(`ordreLigne.id==${this.ordreLigneId}`);

    return true;
  }

  openPhotos(cell) {
    this.ordreLigne = cell.data.ordreLigne;
    this.photosPopup.visible = true;
  }

  openCQReport(cell) {
    console.log("open CQ");
  }

  createPDF(cell) {
    console.log("create PDF");
  }

  openPDF(cell) {
    console.log("open PDF");
  }

  copyPhotosClick() {
    // Procédure copie photos
    const nbPhotos = 0;
    const directory = "fake";
    alert(
      this.localization.localize("copy-photo-finished")
        .replace("&P", nbPhotos.toString())
        .replace("&R", directory),
      this.localization.localize("controle-qualité")
    );
  }

}
