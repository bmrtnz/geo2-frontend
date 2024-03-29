import { DatePipe } from "@angular/common";
import { AfterViewInit, Component, ViewChild } from "@angular/core";
import DeclarationFraude from "app/shared/models/declaration-fraude.model";
import {
  AuthService,
  ClientsService,
  EntrepotsService,
  FournisseursService,
  LocalizationService,
  TransporteursService,
} from "app/shared/services";
import { BureauxAchatService } from "app/shared/services/api/bureaux-achat.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  DxDataGridComponent,
  DxFormComponent,
  DxSelectBoxComponent,
} from "devextreme-angular";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { exportDataGrid } from "devextreme/excel_exporter";
import dxDataGrid from "devextreme/ui/data_grid";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import { defer, of } from "rxjs";
import { concatMap, finalize } from "rxjs/operators";
import { TabContext } from "../../root/root.component";
import notify from "devextreme/ui/notify";


let self;

@Component({
  selector: "app-declaration-fraude",
  templateUrl: "./declaration-fraude.component.html",
  styleUrls: ["./declaration-fraude.component.scss"],
})
export class DeclarationFraudeComponent implements AfterViewInit {
  @ViewChild(DxDataGridComponent) private grid: DxDataGridComponent;
  @ViewChild("valideSB", { static: false }) valideSB: DxSelectBoxComponent;
  @ViewChild("secteurSB", { static: false }) secteurSB: DxSelectBoxComponent;
  @ViewChild("clientSB", { static: false }) clientSB: DxSelectBoxComponent;
  @ViewChild("entrepotSB", { static: false }) entrepotSB: DxSelectBoxComponent;
  @ViewChild("transporteurSB", { static: false }) transporteurSB: DxSelectBoxComponent;
  @ViewChild("bureauAchatSB", { static: false }) bureauAchatSB: DxSelectBoxComponent;
  @ViewChild("fournisseurSB", { static: false }) fournisseurSB: DxSelectBoxComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;

  constructor(
    private currentCompanyService: CurrentCompanyService,
    private ordresService: OrdresService,
    public secteursService: SecteursService,
    private clientsService: ClientsService,
    private entrepotsService: EntrepotsService,
    private transporteursService: TransporteursService,
    private bureauxAchatService: BureauxAchatService,
    private fournisseursService: FournisseursService,
    public dateManagementService: DateManagementService,
    public authService: AuthService,
    private datePipe: DatePipe,
    public localizer: LocalizationService,
    private tabContext: TabContext
  ) {
    self = this;
    this.periodes = this.dateManagementService.periods();

    this.secteurs = secteursService.getDataSource();
    this.secteurs.filter([
      ["valide", "=", true],
      "and",
      ["societes", "contains", this.currentCompanyService.getCompany().id],
    ]);
    this.transporteurs = this.transporteursService.getDataSource_v2([
      "id",
      "raisonSocial",
      "valide",
    ]);
    this.transporteurs.filter(["valide", "=", true]);
    this.bureauxAchat = bureauxAchatService.getDataSource_v2([
      "id",
      "raisonSocial",
    ]);
    this.bureauxAchat.filter(["valide", "=", true]);
    this.filterFournisseurs(); // Initialize fournisseurs
  }

  public preFilterData: {
    dateDepartMin?: Date;
    dateDepartMax?: Date;
    dateModification?: Date;
  };

  public secteurs: DataSource;
  public clients: DataSource;
  public entrepots: DataSource;
  public transporteurs: DataSource;
  public bureauxAchat: DataSource;
  public fournisseurs: DataSource;
  public periodes: any[];
  public dataSource: DataSource;
  public now: number = Date.now();
  public resumeLabel: string;
  public etatLabel: string;
  public maxDays = 15;

  @ViewChild(DxFormComponent) public dxForm: DxFormComponent;
  public summaryFields = ["nombreColisCommandes", "poidsNet"];

  ngAfterViewInit() {
    this.setDefaultPeriod("J");
    this.updateModifiedDate(new Date(this.preFilterData.dateDepartMin));
    this.valideSB.value = true;
    // Only solution found for showing warning
    this.secteurSB.value = "";
  }

  setDefaultPeriod(periodId) {
    let myPeriod = this.dateManagementService.getPeriodFromId(
      periodId,
      this.periodes
    );
    if (!myPeriod) return;
    this.periodeSB?.instance.option("value", myPeriod);
    const datePeriod = this.dateManagementService.getDates({
      value: myPeriod,
    });
    this.dxForm.instance.updateData({
      dateDepartMin: datePeriod.dateDebut,
      dateDepartMax: datePeriod.dateFin,
    });
  }
  displayCodeBefore(data) {
    return data
      ? (data.code ? data.code : data.id) +
      " - " +
      (data.nomUtilisateur
        ? data.nomUtilisateur
        : data.raisonSocial
          ? data.raisonSocial
          : data.description)
      : null;
  }

  filterClients(onlyValids) {
    this.clients = this.clientsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "valide",
    ]);
    const filter: any = [["societe.id", "=", this.currentCompanyService.getCompany().id]];

    if (this.secteurSB?.value) filter.push("and", ["secteur.id", "=", this.secteurSB?.value?.id])
    if (onlyValids) filter.push("and", ["valide", "=", true]);
    this.clients.filter(filter);
  }

  clearCltEnt() {
    this.clientSB.value = null;
    this.entrepotSB.value = null;
  }

  onValideChanged(e) {
    this.clearCltEnt();
    this.filterClients(e.value);
  }

  onSecteurChanged(e) {
    this.filterClients(this.valideSB.value);
    if (e.event) this.clearCltEnt();
  }

  onClientChanged(e) {
    this.entrepots = this.entrepotsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "valide"
    ]);

    const filter: any = [["client.id", "=", e.value?.id]];
    filter.push("and", ["client.societe.id", "=", this.currentCompanyService.getCompany().id]);
    if (this.valideSB.value) filter.push("and", ["valide", "=", true]);
    this.entrepots.filter(filter);

    this.entrepots.load().then((res) => {
      if (res?.length === 1)
        this.entrepotSB.value = { id: res[0].id };
    });
    // We check that this change is coming from the user
    if (!e.event) return;
    this.entrepotSB.value = null;
  }

  filterFournisseurs(bureauAchat?) {
    bureauAchat = bureauAchat?.value ? bureauAchat.value : null;
    this.fournisseurs = this.fournisseursService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
    ]);
    this.fournisseurs.filter(["valide", "=", true]);
    if (bureauAchat)
      this.fournisseurs.filter([
        ["valide", "=", true],
        "and",
        ["bureauAchat.id", "=", bureauAchat.id],
      ]);
  }

  private static handleCalibres(data: Partial<DeclarationFraude>[]) {
    const isCalibreOpening = (
      r1: Partial<DeclarationFraude>,
      r2: Partial<DeclarationFraude>
    ) =>
      r1.numeroOrdre === r2.numeroOrdre &&
      r1.gtinColis === r2.gtinColis &&
      r1.fournisseurCode === r2.fournisseurCode;

    return data.map((row) => {
      // Quelles sont les ouvertures de calibre ?
      const calibres = data.filter((r) => isCalibreOpening(r, row));
      if (calibres.length > 1) {
        // Il peut y avoir x lignes différentes sur la même variété donc on somme
        let commandes = calibres.filter((r) => r.nombreColisCommandes);
        const nbPalettesCommandees = commandes.map(c => c.nombrePalettesCommandees).reduce((a, b) => a + b, 0);
        const nbColisCommandes = commandes.map(c => c.nombreColisCommandes).reduce((a, b) => a + b, 0);
        const commande = {
          nombrePalettesCommandees: nbPalettesCommandees,
          nombreColisCommandes: nbColisCommandes
        }
        // Quelle ligne a le plus gros calibre ?
        return !calibres.find((r) => r.poidsNetColis > row.poidsNetColis)
          ? {
            ...row,
            nombrePalettesCommandees: commande.nombrePalettesCommandees,
            nombreColisCommandes: commande.nombreColisCommandes,
          }
          : { ...row, nombreColisCommandes: 0, nombrePalettesCommandees: 0 };
      }

      return row;
    });
  }

  setGridTitle() {
    this.resumeLabel = this.localizer.localize(
      "fraude-grid-title",
      this.preFilterData.dateDepartMin.toLocaleDateString(),
      this.preFilterData.dateDepartMax.toLocaleDateString(),
      this.secteurSB?.value?.id,
      this.currentCompanyService.getCompany().id
    );
  }

  checkPeriodOver() {
    return this.dateManagementService.getDeltaDate(
      this.preFilterData.dateDepartMin,
      this.preFilterData.dateDepartMax
    ) > this.maxDays;
  }

  public applyPrefilter(event) {
    if (!this.dxForm.instance.validate().isValid) return;
    // Check period
    if (this.checkPeriodOver()) return notify({
      message: this.localizer.localize("warn-period-over", this.maxDays),
      type: "warning",
      displayTime: 4500
    },
      { position: 'bottom center', direction: 'up-stack' }
    );

    this.dataSource = null;

    this.setGridTitle();
    this.grid.instance.beginCustomLoading("");

    this.etatLabel = `${this.localizer.localize(
      "state-from"
    )} ${new Date().toLocaleString()}`;

    of(this.grid.instance.beginCustomLoading("")).pipe(
      concatMap(() =>
        this.ordresService
          .allDeclarationFraude(
            new Set([
              "id",
              "numeroOrdre",
              "dateDepartPrevueFournisseur",
              "clientCode",
              "fournisseurCode",
              "dateDepartPrevue",
              "nombrePalettesCommandees",
              "nombreColisCommandes",
              "origineDescription",
              "paysCode",
              "paysDescription",
              "incotermCode",
              "varieteCode",
              "colisCode",
              "poidsNetClient",
              "poidsNetColis",
              "origineDescription",
              "transporteurCode",
              "dateModification",
              "referenceClient",
              "codeChargement",
              "etdLocation",
              "etdDate",
              "etaLocation",
              "etaDate",
              "commentaireInterne",
              "entrepotCode",
              "typeTransportDescription",
              "baseTarifTransportCode",
              "gtinColis",
              "campagne",
              "ordreAnnule"
            ]),
            this.secteurSB?.value?.id,
            this.currentCompanyService.getCompany().id,
            this.datePipe.transform(
              this.preFilterData?.dateDepartMin,
              "yyyy-MM-dd"
            ),
            this.datePipe.transform(
              this.preFilterData?.dateDepartMax,
              "yyyy-MM-dd"
            ),
            this.datePipe.transform(
              this.preFilterData?.dateModification,
              "yyyy-MM-ddTHH:mm:ss"
            ),
            this.clientSB?.value?.id,
            this.transporteurSB?.value?.id,
            this.fournisseurSB?.value?.code,
            this.bureauAchatSB?.value?.id,
            this.entrepotSB?.value?.id,
          )),
      concatMap((res) => of(DeclarationFraudeComponent.handleCalibres(res))),
      finalize(() => this.grid.instance.endCustomLoading())
    )
      .subscribe((res) => {
        this.dataSource = new DataSource({
          store: new ArrayStore({
            data: res,
          }),
        });
      });
  }

  setDates(e) {
    // We check that this change is coming from the user, not following a prog change

    if (!e.event) return;

    const datePeriod = this.dateManagementService.getDates(e);

    this.preFilterData.dateDepartMin = datePeriod.dateDebut;
    this.preFilterData.dateDepartMax = datePeriod.dateFin;
    this.updateModifiedDate(new Date(datePeriod.dateDebut));
  }

  manuelDateStart(e) {
    this.manualDate(e, 'dateStart');
  }

  manualDate(e, type?) {
    // We check that this change is coming from the user, not following a period change

    if (!e.event) return;

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = this.preFilterData.dateDepartMin;
    const fin = this.preFilterData.dateDepartMax;
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (type === "dateStart") {
        this.preFilterData.dateDepartMax =
          this.dateManagementService.endOfDay(deb);
      } else {
        this.preFilterData.dateDepartMin =
          this.dateManagementService.startOfDay(fin);
      }
    }

    if (type === "dateStart") this.updateModifiedDate(new Date(deb));

    this.periodeSB.value = null;
  }

  updateModifiedDate(deb) {
    // We decide to check modified orders between now and 3 months ago
    // for performance purposes
    this.preFilterData.dateModification =
      this.dateManagementService.startOfDay(new Date(deb.setMonth(deb.getMonth() - 3)));
  }

  onRowPrepared(e) {
    // hide `groupFooter` rows values with `groupIndex=0`
    // see https://supportcenter.devexpress.com/ticket/details/t400328/how-to-hide-summary-values-in-a-certain-group-row
    if (e.rowType === "groupFooter" && e.groupIndex !== 3)
      e.rowElement.classList.add("hide-row");

    // add custom style to main group row
    if (e.rowType === "group") {
      if (e.groupIndex === 0) e.rowElement.classList.add("justified-row");
      if (e.groupIndex === 3) e.rowElement.classList.add("hide-row");

      // Canceled orders
      let data = e.data.items ?? e.data.collapsedItems;
      data = data[0];
      const isCanceled = data?.ordreAnnule === true || (data.items ? data.items[0]?.ordreAnnule : false);

      if (isCanceled) {
        e.rowElement.classList.add("canceled-orders");
        e.rowElement.title += e.rowElement.title ?? " - ";
        e.rowElement.title += this.localizer.localize("ordre-annule");
      }
    }

    if (e.rowType === "data") {
      // Canceled orders
      if (e.data?.ordreAnnule === true) {
        e.rowElement.classList.add("canceled-orders");
        e.rowElement.title += this.localizer.localize("ordre-annule") + " - ";
      }
      // Dble click
      e.rowElement.classList.add("cursor-pointer");
      e.rowElement.title += this.localizer.localize("hint-dblClick-ordre")
    }
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.nombreColisCommandes) e.cellElement.classList.add("bold-black");
    }
  }

  // Open selected ordre on group/line row double-click
  public onRowDblClick({ data, rowType }: { rowType: "group"; data: any }) {
    if (rowType === "group") {
      if (!data.items && !data.collapsedItems) return;
      let dataItems = data.items ? data.items[0] : data.collapsedItems[0];
      dataItems = dataItems.items ? dataItems.items[0] : dataItems;
      dataItems = dataItems.items ? dataItems.items[0] : dataItems;
      if (!dataItems?.numeroOrdre) return;
      this.tabContext.openOrdre(dataItems.numeroOrdre, dataItems.campagne);
    } else {
      this.tabContext.openOrdre(data.numeroOrdre, data.campagne);
    }
  }

  isValue(rowData: Partial<DeclarationFraude>, dataField: string) {
    const value = rowData[dataField];
    return value !== null && value !== undefined;
  }


  calculateArticleValue(rowData: Partial<DeclarationFraude>) {
    return `${rowData.varieteCode} - ${rowData.colisCode} - ${rowData.poidsNetColis} kg - ${rowData.origineDescription}`;
  }

  calculatePoidsNetValue(rowData: Partial<DeclarationFraude>) {
    return Math.ceil(rowData.nombreColisCommandes * rowData.poidsNetColis);
  }

  calculatePaysValue(rowData: Partial<DeclarationFraude>) {
    return `${rowData.paysCode} - ${rowData.paysDescription}`;
  }

  calculateGroupeOrdreLibelle(rowData: Partial<DeclarationFraude>) {
    // Ajout client / entrep. + réf client + code transp. ...
    let gText = `${rowData.numeroOrdre.ucFirst()} `;
    gText += `${self.localizer.localize("client").ucFirst()} : `;
    gText += `${rowData.clientCode} / ${rowData.entrepotCode} `;
    gText += `- ${self.localizer.localize("ref")} : ` + (self.isValue(rowData, "referenceClient") ? `${rowData.referenceClient} ` : ``);
    gText += self.isValue(rowData, "codeChargement") ? `${rowData.codeChargement} ` : ``;
    gText += self.isValue(rowData, "etdDate") ? `ETD : ${self.datePipe.transform(rowData.etdDate, "dd-MM-yyyy")} ${rowData.etdLocation} ` : ` `;
    gText += self.isValue(rowData, "etaDate") ? `ETA : ${self.datePipe.transform(rowData.etaDate, "dd-MM-yyyy")} ${rowData.etaLocation} ` : ` `;
    gText += `(${self.datePipe.transform(rowData.dateModification, "dd-MM-yyyy hh:mm:ss")}) `;
    gText += self.isValue(rowData, "commentaireInterne") ? `${self.localizer.localize("fraude-douane")} : ${rowData.commentaireInterne} ` : ``;
    gText += `${self.localizer.localize("transporteur").ucFirst()} : ${rowData.transporteurCode} `;

    return gText;
  }

  onExporting(event: { component: dxDataGrid; cancel: boolean }, component) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet();
    const redundantRows = event.component
      .getVisibleRows()
      .filter((r) => (r.rowType === "groupFooter" && r.groupIndex !== 3) || (r.rowType === "group" && r.groupIndex === 3))
      .map((r) => r.rowIndex);
    exportDataGrid({
      component: event.component,
      worksheet,
      customizeCell: ({ gridCell, excelCell }) => {
        excelCell.font = {};
        if (gridCell.rowType === "data") {
          // Canceled orders rows should be in red
          if (gridCell.data?.ordreAnnule) excelCell.font.color = { argb: 'FF325A' }
          // Bold rows when colis commandés
          if (gridCell.data?.nombreColisCommandes) excelCell.font.bold = true;
        }
      }
    }).then(() => {
      const offset = 2;
      redundantRows.forEach((r, i) =>
        workbook.getWorksheet(1).spliceRows(r - i + offset, 1)
      );
      workbook.xlsx.writeBuffer().then((buffer: BlobPart) => {
        const name = `${this.localizer.localize(
          "declaration-fraude"
        )} - ${this.dateManagementService.formatDate(new Date(), "dd-MM-yyyy")}`;
        saveAs(
          new Blob([buffer], { type: "application/octet-stream" }),
          `${name}.xlsx`
        );
      });
    });
    event.cancel = true;
  }
}

String.prototype.ucFirst = function () {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

export default DeclarationFraudeComponent;
