import { DatePipe } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { TabContext } from "app/pages/ordres/root/root.component";
import { EdiOrdre } from "app/shared/models";
import { AuthService, LocalizationService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdresEdiService } from "app/shared/services/api/ordres-edi.service";
import { StockArticleEdiBassinService } from "app/shared/services/api/stock-article-edi-bassin.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import {
  DxPopupComponent,
  DxScrollViewComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { concatMap, finalize, forkJoin } from "rxjs";
import { GridRecapStockCdeEdiColibriComponent } from "../grid-recap-stock-cde-edi-colibri/grid-recap-stock-cde-edi-colibri.component";


@Component({
  selector: 'app-recap-stock-cde-edi-colibri-popup',
  templateUrl: './recap-stock-cde-edi-colibri-popup.component.html',
  styleUrls: ['./recap-stock-cde-edi-colibri-popup.component.scss']
})
export class RecapStockCdeEdiColibriPopupComponent implements OnInit {
  @Input() public refOrdreEDI: EdiOrdre["id"];
  @Output() public gridSelectionEnabled: boolean;
  @Output() refreshGridCdeEdi = new EventEmitter<any>();
  @Output() public selectedRows: any[];

  visible: boolean;
  nbLignes: number;
  nbLignesOld: number;
  chosenArticles: string[];
  titleStart: string;
  titleMid: string;
  pulseBtnOn: boolean;
  popupFullscreen = true;
  creatingOrder = false;
  selectedGTIN: string[];
  resultsGTIN: string[];


  @ViewChild(GridRecapStockCdeEdiColibriComponent, { static: false }) gridRecap: GridRecapStockCdeEdiColibriComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  constructor(
    private functionsService: FunctionsService,
    private currentCompanyService: CurrentCompanyService,
    private stockArticleEdiBassinService: StockArticleEdiBassinService,
    private ordresEdiService: OrdresEdiService,
    private gridUtilsService: GridUtilsService,
    private datePipe: DatePipe,
    private tabContext: TabContext,
    private authService: AuthService,
    private localization: LocalizationService,
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
    this.checkValidQties();
  }


  getGridSelectedArticles() {
    // We ensure that all GTIN are selected
    this.selectedGTIN = [];
    this.resultsGTIN = [];
    this.gridRecap.datagrid.instance.getSelectedRowsData().map(row => this.selectedGTIN.push(row.gtin))
    this.selectedGTIN = Array.from(new Set(this.selectedGTIN));
    (this.gridRecap.datagrid.dataSource as DataSource).items().map((ds) => this.resultsGTIN.push(ds.gtin));
    this.resultsGTIN = Array.from(new Set(this.resultsGTIN));

    return this.gridRecap.datagrid.instance.getSelectedRowsData();
  }

  selectFromGrid(e) {
    if (!this.gridRecap.datagrid.dataSource) return;
    this.updateChosenArticles();
    this.saveChoices();
  }

  saveChoices() {
    const rows = this.gridRecap.datagrid.instance.getVisibleRows();
    const updatedRows = rows.map(row => ({
      id: row.data.id,
      choix: row.isSelected,
    }));
    this.stockArticleEdiBassinService.saveAll(new Set(["id", "choix"]), updatedRows)
      .subscribe({
        next: (res) => console.log(res),
        error: (error: Error) => notify(this.messageFormat(error.message), "error", 7000)
      });
  }

  checkValidQties() {
    this.selectedRows = this.gridRecap.datagrid.instance.getSelectedRowsData().slice();
    this.selectedRows.sort((a, b) => a.gtin.localeCompare(b.gtin));
    this.selectedRows.push({ gtin: "fake" })
    let sumQuantiteValidee = 0, oldGtin, oldQuantiteColis, oldRow;
    this.selectedRows.map(row => {
      if (row.gtin !== oldGtin && oldGtin) {
        oldRow.warning = (sumQuantiteValidee > oldQuantiteColis);
        sumQuantiteValidee = 0;
      }
      oldGtin = row.gtin;
      oldRow = row;
      oldQuantiteColis = row.ligneEdi?.quantiteColis ?? 0;
      sumQuantiteValidee += row.quantiteValidee ?? 0;
    });
    this.selectedRows.pop(); // Remove fake item
  }

  noWarningShown() {
    return !this.selectedRows.filter(r => r.warning)?.length;
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
  }

  hidePopup() {
    this.popup.visible = false;
    this.creatingOrder = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  clearAndHidePopup() {
    this.hidePopup();
    this.clearAll();
  }

  createOrder() {
    const rows = this.gridRecap.datagrid.instance.getVisibleRows();
    if (!rows.length) return;
    this.creatingOrder = true;
    notify(this.localization.localize("creer-ordre(s)-en-cours"), "info", 5000);
    const updatedRows = rows.map(row => ({
      id: row.data.id,
      choix: row.isSelected,
    }));
    this.stockArticleEdiBassinService.saveAll(new Set(["id", "choix"]), updatedRows).pipe(
      concatMap(_res => forkJoin([this.functionsService.ofControleSelArt, this.functionsService.ofControleQteArt]
        .map(f => f(this.refOrdreEDI, this.currentCompanyService.getCompany().campagne.id)))),
      concatMap(() => this.ordresEdiService.getOne(this.refOrdreEDI, new Set([
        "entrepot.id",
        "client.id",
        "dateLivraison",
        "referenceCommandeClient",
      ]))),
      concatMap(res => this.ordresEdiService.fCreeOrdresEdi(
        this.currentCompanyService.getCompany().id,
        res.data.ediOrdre.entrepot.id,
        this.datePipe.transform(res.data.ediOrdre.dateLivraison, "yyyy-MM-dd"),
        this.currentCompanyService.getCompany().campagne.id,
        res.data.ediOrdre.referenceCommandeClient,
        res.data.ediOrdre.client.id,
        this.refOrdreEDI.toFixed(),
        this.authService.currentUser.nomUtilisateur
      )),
    )
      .subscribe({
        next: res => {
          let noOrdres = res.data.fCreeOrdresEdi.data?.ls_nordre_tot;
          noOrdres = noOrdres.split(",");
          noOrdres.pop();
          const text = this.localization.localize("ordre-crees-edi", this.gridUtilsService.friendlyFormatList(noOrdres));
          notify(text, "success", 5000);
          this.clearAndHidePopup();
          noOrdres.map(numero => {
            setTimeout(() =>
              this.tabContext.openOrdre(
                numero,
                this.currentCompanyService.getCompany().campagne.id,
                false
              )
            );
          });
          this.refreshGridCdeEdi.emit();
        },
        error: (err: Error) => notify(err.message, "error", 7000),
      });
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
