import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { ArticlesListComponent } from "app/pages/articles/list/articles-list.component";
import Ordre from "app/shared/models/ordre.model";
import { ArticlesService, LocalizationService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { DxButtonComponent, DxPopupComponent, DxScrollViewComponent, DxTagBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { from } from "rxjs";
import { concatMap, takeWhile } from "rxjs/operators";
import { GridLignesGroupageChargementsComponent } from "./grid-lignes-groupage-chargements/grid-lignes-groupage-chargements.component";

@Component({
  selector: "app-groupage-chargements-popup",
  templateUrl: "./groupage-chargements-popup.component.html",
  styleUrls: ["./groupage-chargements-popup.component.scss"]
})
export class GroupageChargementsPopupComponent implements OnChanges {

  @Input() public ordre: Ordre;
  @Input() public gridCommandes: any;
  @Input() public gridEnvois: any;
  @Output() public gridCdes: any;
  @Output() public gridEnv: any;

  visible: boolean;
  idArticlesDS: DataSource;
  codeChangeProcess: boolean;
  articlesKO = true;
  validBtnText: string;
  nbARticles: number;
  nbArticlesOld: number;
  chosenArticles: string[];
  ordreInfo = "";
  title: string;
  pulseBtnOn: boolean;
  remplacementArticle: boolean;
  popupFullscreen = false;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;
  @ViewChild(GridLignesGroupageChargementsComponent, { static: false }) gridComponent: GridLignesGroupageChargementsComponent;

  constructor(
    public OrdreLigneService: OrdreLignesService,
    private gridConfiguratorService: GridConfiguratorService,
    private functionsService: FunctionsService,
    private currentCompanyService: CurrentCompanyService,
    private localizeService: LocalizationService
  ) { }

  ngOnChanges() {
    this.setTitle();
    this.gridCdes = this.gridCommandes;
    this.gridEnv = this.gridEnvois;
  }

  setTitle() {
    this.title = this.localizeService.localize("groupage-chargements");
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("groupage-chargements-popup");
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    if (this.ordre) this.gridComponent.enableFilters();
  }

  closePopup() {
    if (this.gridComponent.datagrid.instance.hasEditData()) {
      this.hidePopup();
    } else {
      this.hidePopup();
    }
  }

  hidePopup() {
    this.popup.visible = false;
    this.gridComponent.datagrid.dataSource = null;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

}


