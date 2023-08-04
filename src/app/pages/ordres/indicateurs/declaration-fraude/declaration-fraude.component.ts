import { DatePipe } from "@angular/common";
import { AfterViewInit, Component, ViewChild } from "@angular/core";
import {
  BureauAchat,
  Client,
  Entrepot,
  Fournisseur,
  Secteur,
  Transporteur,
} from "app/shared/models";
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
import { of } from "rxjs";
import { concatMap, finalize } from "rxjs/operators";
@Component({
  selector: "app-declaration-fraude",
  templateUrl: "./declaration-fraude.component.html",
  styleUrls: ["./declaration-fraude.component.scss"],
})
export class DeclarationFraudeComponent implements AfterViewInit {
  @ViewChild(DxDataGridComponent) private grid: DxDataGridComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;

  constructor(
    private currentCompanyService: CurrentCompanyService,
    private ordresService: OrdresService,
    private secteursService: SecteursService,
    private clientsService: ClientsService,
    private entrepotsService: EntrepotsService,
    private transporteursService: TransporteursService,
    private bureauxAchatService: BureauxAchatService,
    private fournisseursService: FournisseursService,
    public dateManagementService: DateManagementService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private localizer: LocalizationService
  ) {
    [
      this.clientLookupStore,
      this.entrepotLookupStore,
      this.fournisseurLookupStore,
    ].forEach((storeConfig) => {
      storeConfig.sort = [{ selector: "code" }];
    });
    this.periodes = this.dateManagementService.periods();
  }

  public preFilterData: {
    secteur?: Partial<Secteur>;
    client?: Partial<Client>;
    entrepot?: Partial<Entrepot>;
    transporteur?: Partial<Transporteur>;
    bureauAchat?: Partial<BureauAchat>;
    fournisseur?: Partial<Fournisseur>;
    dateDepartPrevue?: Date;
    dateLivraisonPrevue?: Date;
    dateModification?: Date;
    periode?;
  } = {
      dateDepartPrevue: this.dateManagementService.startOfDay(),
      dateLivraisonPrevue: this.dateManagementService.endOfDay(),
    };

  public periodes: any[];
  public dataSource: DataSource;
  public now: number = Date.now();
  public resumeLabel: string;
  public etatLabel: string;
  @ViewChild(DxFormComponent) public dxForm: DxFormComponent;

  public secteurLookupStore = this.secteursService.getLookupStore(
    ["id"],
    "valide==true"
  );
  public clientLookupStore = this.clientsService.getLookupStore(
    ["id", "code"],
    `valide==true and societe.id == ${this.currentCompanyService.getCompany().id
    }`
  );
  public entrepotLookupStore = this.entrepotsService.getLookupStore(
    ["id", "code"],
    `valide==true and societe.id == ${this.currentCompanyService.getCompany().id
    }`
  );
  public transportLookupStore = this.transporteursService.getLookupStore(
    ["id"],
    `valide==true`
  );
  public bureauAchatLookupStore = this.bureauxAchatService.getLookupStore(
    ["id"],
    `valide==true`
  );
  public fournisseurLookupStore = this.fournisseursService.getLookupStore(
    ["id", "code"],
    `valide==true`
  );

  ngAfterViewInit() {
    this.setDefaultPeriod(this.authService.currentUser?.periode ?? "MAC");
  }

  setDefaultPeriod(periodId) {
    let myPeriod = this.dateManagementService.getPeriodFromId(
      periodId,
      this.periodes
    );
    if (!myPeriod) return;
    this.periodeSB.instance.option("value", myPeriod);
    const datePeriod = this.dateManagementService.getDates({
      value: myPeriod,
    });
    this.dxForm.instance.updateData({
      dateDepartPrevue: datePeriod.dateDebut,
      dateLivraisonPrevue: datePeriod.dateFin,
    });
  }

  private static handleCalibres(data: Partial<DeclarationFraude>[]) {
    const isCalibreOpening = (
      r1: Partial<DeclarationFraude>,
      r2: Partial<DeclarationFraude>
    ) =>
      r1.numeroOrdre === r2.numeroOrdre &&
      r1.varieteCode === r2.varieteCode &&
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
        return !calibres.find((r) => r.poidsNetClient > row.poidsNetClient)
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
      this.preFilterData.dateDepartPrevue.toLocaleDateString(),
      this.preFilterData.dateLivraisonPrevue.toLocaleDateString(),
      this.preFilterData.secteur.id,
      this.currentCompanyService.getCompany().id
    );
  }

  public applyPrefilter(event) {
    if (!this.dxForm.instance.validate().isValid) return;

    this.dataSource = null;

    this.setGridTitle();
    setTimeout(() => this.grid.instance.beginCustomLoading(""), 100);

    this.etatLabel = `${this.localizer.localize(
      "state-from"
    )} ${new Date().toLocaleString()}`;

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
          "entrepotCode"
        ]),
        this.preFilterData?.secteur?.id,
        this.currentCompanyService.getCompany().id,
        this.datePipe.transform(
          this.preFilterData?.dateDepartPrevue,
          "yyyy-MM-dd"
        ),
        this.datePipe.transform(
          this.preFilterData?.dateLivraisonPrevue,
          "yyyy-MM-dd"
        ),
        this.datePipe.transform(
          this.preFilterData?.dateModification,
          "yyyy-MM-ddTHH:mm:ss"
        ),
        this.preFilterData?.client?.id,
        this.preFilterData?.transporteur?.id,
        this.preFilterData?.fournisseur?.code,
        this.preFilterData?.bureauAchat?.id,
        this.preFilterData?.entrepot?.id
      )
      .pipe(
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

  isValue(data, field) {
    const value = data.data.items[0].items[0][field];
    return value !== null && value !== undefined;
  }

  setDates(e) {
    // We check that this change is coming from the user, not following a prog change
    if (!e.event) return;

    const datePeriod = this.dateManagementService.getDates(e);

    this.preFilterData.dateDepartPrevue = datePeriod.dateDebut;
    this.preFilterData.dateLivraisonPrevue = datePeriod.dateFin;
  }

  manuelDateStart(e) {
    this.manualDate(e, 'dateStart');
  }

  manualDate(e, type?) {
    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = this.preFilterData.dateDepartPrevue;
    const fin = this.preFilterData.dateLivraisonPrevue;
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (type === "dateStart") {
        this.preFilterData.dateLivraisonPrevue =
          this.dateManagementService.endOfDay(deb);
      } else {
        this.preFilterData.dateDepartPrevue =
          this.dateManagementService.startOfDay(fin);
      }
    }
    this.periodeSB.value = null;
  }

  onRowPrepared(e) {
    // hide `groupFooter` rows values with `groupIndex=0`
    // see https://supportcenter.devexpress.com/ticket/details/t400328/how-to-hide-summary-values-in-a-certain-group-row
    if (e.rowType === "groupFooter" && e.groupIndex !== 2)
      e.rowElement.classList.add("hide-row");

    // add custom style to main group row
    if (e.rowType === "group" && e.groupIndex === 0)
      e.rowElement.classList.add("justified-row");
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // console.log(e);
      if (e.data.nombreColisCommandes)
        e.cellElement.classList.add("bold-black");
    }
  }

  calculateArticleValue(rowData: Partial<DeclarationFraude>) {
    return `${rowData.varieteCode} - ${rowData.colisCode} - ${rowData.poidsNetClient} kg - ${rowData.origineDescription}`;
  }

  calculatePoidsNetValue(rowData: Partial<DeclarationFraude>) {
    return Math.ceil(rowData.nombreColisCommandes * rowData.poidsNetClient);
  }

  calculatePaysValue(rowData: Partial<DeclarationFraude>) {
    return `${rowData.paysCode} - ${rowData.paysDescription}`;
  }

  onExporting(event: { component: dxDataGrid; cancel: boolean }) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet();
    const redundantRows = event.component
      .getVisibleRows()
      .filter((r) => r.rowType === "groupFooter" && r.groupIndex !== 2)
      .map((r) => r.rowIndex);
    exportDataGrid({
      component: event.component,
      worksheet,
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

export default DeclarationFraudeComponent;
