import { DatePipe } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
import { BureauAchat, Client, Entrepot, Fournisseur, Secteur, Transporteur } from "app/shared/models";
import DeclarationFraude from "app/shared/models/declaration-fraude.model";
import { ClientsService, EntrepotsService, FournisseursService, TransporteursService } from "app/shared/services";
import { BureauxAchatService } from "app/shared/services/api/bureaux-achat.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { DxFormComponent } from "devextreme-angular";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { of } from "rxjs";
import { concatMap } from "rxjs/operators";

@Component({
  selector: "app-declaration-fraude",
  templateUrl: "./declaration-fraude.component.html",
  styleUrls: ["./declaration-fraude.component.scss"]
})
export class DeclarationFraudeComponent {

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
  ) {
    [
      this.clientLookupStore,
      this.entrepotLookupStore,
      this.fournisseurLookupStore,
    ].forEach(storeConfig => {
      storeConfig.sort = [{ selector: "code" }];
    });
    this.periodes = this.dateManagementService.periods();
  }

  public preFilterData: {
    secteur?: Partial<Secteur>,
    client?: Partial<Client>,
    entrepot?: Partial<Entrepot>,
    transporteur?: Partial<Transporteur>,
    bureauAchat?: Partial<BureauAchat>,
    fournisseur?: Partial<Fournisseur>,
    dateDepartPrevue?: Date,
    dateLivraisonPrevue?: Date,
    dateModification?: Date,
    periode?,
  } = {
      // dateDepartPrevue: this.dateManagementService.startOfDay(),
      // dateLivraisonPrevue: this.dateManagementService.endOfDay(),
      // TODO VIRER CA
      secteur: { id: "F" },
      client: { id: "006784" },
      dateDepartPrevue: new Date(Date.parse("2023-04-20")),
      dateLivraisonPrevue: new Date(Date.parse("2023-04-22")),
      dateModification: new Date(Date.parse("2023-04-20")),
    };

  public periodes: string[];
  public dataSource: DataSource;
  @ViewChild(DxFormComponent) public dxForm: DxFormComponent;

  public secteurLookupStore = this.secteursService
    .getLookupStore(["id"], "valide==true");
  public clientLookupStore = this.clientsService
    .getLookupStore(["id", "code"], `valide==true and societe.id == ${this.currentCompanyService.getCompany().id}`);
  public entrepotLookupStore = this.entrepotsService
    .getLookupStore(["id", "code"], `valide==true and societe.id == ${this.currentCompanyService.getCompany().id}`);
  public transportLookupStore = this.transporteursService
    .getLookupStore(["id"], `valide==true`);
  public bureauAchatLookupStore = this.bureauxAchatService
    .getLookupStore(["id"], `valide==true`);
  public fournisseurLookupStore = this.fournisseursService
    .getLookupStore(["id", "code"], `valide==true`);

  private static handleCalibres(data: Partial<DeclarationFraude>[]) {
    const isCalibreOpening = (r1: Partial<DeclarationFraude>, r2: Partial<DeclarationFraude>) =>
      r1.varieteCode === r2.varieteCode
      && r1.fournisseurCode === r2.fournisseurCode;

    return data.map(row => {
      // La ligne fait elle partie d'une ouverture de calibre ?
      if (data.filter(r => isCalibreOpening(r, row)).length > 1) {
        const commande = data.find(r => r.nombreColisCommandes);
        // La ligne a t'elle un plus gros calibre ?
        return !data.find(r => r.poidsNetClient > row.poidsNetClient)
          ? { ...row, nombrePalettesCommandees: commande.nombrePalettesCommandees, nombreColisCommandes: commande.nombreColisCommandes }
          : { ...row, nombreColisCommandes: 0, nombrePalettesCommandees: 0 };
      }

      return row;
    });
  }

  public applyPrefilter(event) {
    if (!this.dxForm.instance.validate().isValid) return;

    this.ordresService.allDeclarationFraude(
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
      this.datePipe.transform(this.preFilterData?.dateDepartPrevue, "yyyy-MM-dd"),
      this.datePipe.transform(this.preFilterData?.dateLivraisonPrevue, "yyyy-MM-dd"),
      this.datePipe.transform(this.preFilterData?.dateModification, "yyyy-MM-ddTHH:mm:ss"),
      this.preFilterData?.client?.id,
      this.preFilterData?.transporteur?.id,
      this.preFilterData?.fournisseur?.code,
      this.preFilterData?.bureauAchat?.id,
      this.preFilterData?.entrepot?.id,
    ).pipe(
      concatMap(res => of(DeclarationFraudeComponent.handleCalibres(res))),
    ).subscribe(res => {
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
        this.preFilterData.dateLivraisonPrevue = this.dateManagementService.endOfDay(deb);
      } else {
        this.preFilterData.dateDepartPrevue = this.dateManagementService.startOfDay(fin);
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

}

export default DeclarationFraudeComponent;
