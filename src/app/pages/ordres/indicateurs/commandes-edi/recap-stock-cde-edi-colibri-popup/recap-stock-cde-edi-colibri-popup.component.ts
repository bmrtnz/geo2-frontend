import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { EdiOrdre } from "app/shared/models";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import {
  DxButtonComponent,
  DxPopupComponent,
  DxScrollViewComponent,
} from "devextreme-angular";
import { GridRecapStockCdeEdiColibriComponent } from "../grid-recap-stock-cde-edi-colibri/grid-recap-stock-cde-edi-colibri.component";


@Component({
  selector: 'app-recap-stock-cde-edi-colibri-popup',
  templateUrl: './recap-stock-cde-edi-colibri-popup.component.html',
  styleUrls: ['./recap-stock-cde-edi-colibri-popup.component.scss']
})
export class RecapStockCdeEdiColibriPopupComponent implements OnInit {
  @Input() public refOrdreEDI: EdiOrdre["id"];
  @Output() public gridSelectionEnabled: boolean;


  visible: boolean;
  nbLignes: number;
  nbLignesOld: number;
  chosenArticles: string[];
  titleStart: string;
  titleMid: string;
  pulseBtnOn: boolean;
  popupFullscreen = true;

  @ViewChild(GridRecapStockCdeEdiColibriComponent, { static: false })
  gridRecap: GridRecapStockCdeEdiColibriComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild("addButton", { static: false }) addButton: DxButtonComponent;
  @ViewChild(DxScrollViewComponent, { static: false })
  dxScrollView: DxScrollViewComponent;

  constructor(
    private gridUtilsService: GridUtilsService,
    private localizeService: LocalizationService
  ) { }

  ngOnInit() {
    this.titleStart = this.localizeService.localize("recap-stock-cde");
    this.titleMid = this.localizeService.localize("edi-colibri");
  }

  updateChosenArticles() {
    const selectedRows = this.getGridSelectedArticles();
    this.chosenArticles = [];
    this.chosenArticles = selectedRows.map((row) => row.article.id);
    this.nbLignes = this.chosenArticles.length;
    if (this.nbLignes !== this.nbLignesOld) {
      this.pulseBtnOn = false;
      setTimeout(() => (this.pulseBtnOn = true), 1);
    }
    this.nbLignesOld = this.nbLignes;
  }

  getGridSelectedArticles() {
    return this.gridRecap.datagrid.instance.getSelectedRowsData();
  }

  selectFromGrid(e) {
    this.updateChosenArticles();
  }

  onShowing(e) {
    e.component
      .content()
      .parentNode.classList.add("recap-stock-cde-edi-colibri-popup");
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.gridRecap?.enableFilters();
  }

  clearAll() {
    this.gridRecap.datagrid.instance.clearSelection();
    this.gridRecap.datagrid.dataSource = null;
    this.updateChosenArticles();
  }

  hidePopup() {
    this.popup.visible = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  clearAndHidePopup() {
    this.hidePopup();
    this.clearAll();
  }

  createOrder() {
    //////////////////////////////////////////////////////////////////
    // Implémentation
    // Création ordre
    //////////////////////////////////////////////////////////////////
  }

  private messageFormat(mess) {
    const functionNames = ["ofInitArticle"];
    functionNames.map(
      (fn) =>
        (mess = mess.replace(`Exception while fetching data (/${fn}) : `, ""))
    );
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }
}
