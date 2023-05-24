import { DatePipe } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
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
import { DxDataGridComponent, DxFormComponent } from "devextreme-angular";
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
export class DeclarationFraudeComponent {
  @ViewChild(DxDataGridComponent) private grid: DxDataGridComponent;

  constructor(
    private currentCompanyService: CurrentCompanyService,
    private ordresService: OrdresService,
    private secteursService: SecteursService,
    private clientsService: ClientsService,
    private entrepotsService: EntrepotsService,
    private transporteursService: TransporteursService,
    private bureauxAchatService: BureauxAchatService,
    private fournisseursService: FournisseursService,
    private dateManagementService: DateManagementService,
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

  public periodes: string[];
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
    `valide==true and societe.id == ${
      this.currentCompanyService.getCompany().id
    }`
  );
  public entrepotLookupStore = this.entrepotsService.getLookupStore(
    ["id", "code"],
    `valide==true and societe.id == ${
      this.currentCompanyService.getCompany().id
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

  private static handleCalibres(data: Partial<DeclarationFraude>[]) {
    const isCalibreOpening = (
      r1: Partial<DeclarationFraude>,
      r2: Partial<DeclarationFraude>
    ) =>
      r1.varieteCode === r2.varieteCode &&
      r1.fournisseurCode === r2.fournisseurCode;

    return data.map((row) => {
      // La ligne fait elle partie d'une ouverture de calibre ?
      if (data.filter((r) => isCalibreOpening(r, row)).length > 1) {
        const commande = data.find((r) => r.nombreColisCommandes);
        // La ligne a t'elle un plus gros calibre ?
        return !data.find((r) => r.poidsNetClient > row.poidsNetClient)
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

    this.setGridTitle();
    this.grid.instance.beginCustomLoading("");

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

  setDates(e) {
    // We check that this change is coming from the user, not following a prog change
    if (!e.event) return;

    const datePeriod = this.dateManagementService.getDates(e);

    this.preFilterData.dateDepartPrevue = datePeriod.dateDebut;
    this.preFilterData.dateLivraisonPrevue = datePeriod.dateFin;
  }

  manualDate(e) {
    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = this.preFilterData.dateDepartPrevue;
    const fin = this.preFilterData.dateLivraisonPrevue;
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (e.element.classList.contains("dateStart")) {
        this.preFilterData.dateLivraisonPrevue =
          this.dateManagementService.endOfDay(deb);
      } else {
        this.preFilterData.dateDepartPrevue =
          this.dateManagementService.startOfDay(fin);
      }
    }
    this.preFilterData.periode = null;
  }

  onRowPrepared(event) {
    // hide `groupFooter` rows values with `groupIndex=0`
    // see https://supportcenter.devexpress.com/ticket/details/t400328/how-to-hide-summary-values-in-a-certain-group-row
    if (event.rowType === "groupFooter" && event.groupIndex !== 2)
      event.rowElement.classList.add("hide-row");

    // add custom style to main group row
    if (event.rowType === "group" && event.groupIndex === 0)
      event.rowElement.classList.add("justified-row");
  }

  calculateArticleValue(rowData: Partial<DeclarationFraude>) {
    return `${rowData.varieteCode} ${rowData.colisCode} ${rowData.poidsNetClient}kg ${rowData.origineDescription}`;
  }

  calculatePoidsNetValue(rowData: Partial<DeclarationFraude>) {
    return rowData.nombreColisCommandes * rowData.poidsNetClient;
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
        )} - ${new Date().toLocaleDateString()}`;
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
