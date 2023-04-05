import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ConfirmationResultPopupComponent } from "app/shared/components/confirmation-result-popup/confirmation-result-popup.component";
import { FileManagerComponent } from "app/shared/components/file-manager/file-manager-popup.component";
import { Flux, OrdreLigne } from "app/shared/models";
import LitigeLigneTotaux from "app/shared/models/litige-ligne-totaux.model";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import { Ordre, Statut } from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { EnvoisService } from "app/shared/services/api/envois.service";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import { LitigesService } from "app/shared/services/api/litiges.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { FluxEnvoisService } from "app/shared/services/flux-envois.service";
import { DxNumberBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { from, iif, of } from "rxjs";
import { concatMap, filter, map, mergeAll } from "rxjs/operators";
// tslint:disable-next-line: max-line-length
import { DocumentsOrdresPopupComponent } from "../documents-ordres-popup/documents-ordres-popup.component";
import { GestionOperationsPopupComponent } from "../gestion-operations-popup/gestion-operations-popup.component";
import { GridLitigesLignesComponent } from "../grid-litiges-lignes/grid-litiges-lignes.component";
import { LitigeCloturePopupComponent } from "../indicateurs/litiges/litige-cloture-popup/litige-cloture-popup.component";
import { SelectionLignesLitigePopupComponent } from "../selection-lignes-litige-popup/selection-lignes-litige-popup.component";
import { FraisAnnexesLitigePopupComponent } from "./frais-annexes-litige-popup/frais-annexes-litige-popup.component";

@Component({
  selector: "app-form-litiges",
  templateUrl: "./form-litiges.component.html",
  styleUrls: ["./form-litiges.component.scss"],
})
export class FormLitigesComponent implements OnInit, OnChanges {
  @Input() public ordre: Ordre;
  @Input() public gridCdeHasRows: boolean;
  @Input() selectedLitigeLigneKey: LitigeLigne["id"];
  @Input() grid: GridLitigesLignesComponent;
  @Output() public ordreSelected = new EventEmitter<Litige>();
  @Output() public currOrdre;
  @Output() public infosLitige: any;
  @Output() public litigeID: string;

  formGroup = this.fb.group({
    id: [""],
    ordreAvoirFournisseur: this.fb.group({
      id: [""],
      numero: [""]
    }),
    dateCreation: [""],
    avoirClient: [""],
    avoirClientTaux: [""],
    dateAvoirClient: [""],
    avoirFournisseurTaux: [""],
    avoirFournisseur: [""],
    dateAvoirFournisseur: [""],
    referenceClient: [""],
    clientCloture: [""],
    fournisseurCloture: [""],
    clientValideAdmin: [""],
    fournisseurValideAdmin: [""],
    commentairesInternes: [""],
    totalMontantRistourneTaux: [""],
    ordreAvoirClient: this.fb.group({
      id: [""],
      numero: [""]
    }),
    fraisAnnexes: [""],
    totalMontantRistourne: [""],
  });

  contentReadyEvent = new EventEmitter<any>();
  refreshGrid = new EventEmitter();

  ordres: DataSource;
  noLitiges = null;
  devise = "EUR";
  ddeAvoirFournisseur: any;
  totalMontantRistourne: any;
  // disableCreate: boolean;
  columns: any;
  public litigeClosed: boolean;
  public noFraisAnnexes: boolean;

  @ViewChild("resultat", { static: false }) resultat: DxNumberBoxComponent;
  @ViewChild(LitigeCloturePopupComponent, { static: false }) cloturePopup: LitigeCloturePopupComponent;
  @ViewChild(FraisAnnexesLitigePopupComponent, { static: false }) fraisAnnexesPopup: FraisAnnexesLitigePopupComponent;
  @ViewChild(SelectionLignesLitigePopupComponent, { static: false }) selectLignesPopup: SelectionLignesLitigePopupComponent;
  @ViewChild(GestionOperationsPopupComponent, { static: false }) gestionOpPopup: GestionOperationsPopupComponent;
  @ViewChild(ConfirmationResultPopupComponent) envoisFluxWarningPopup: ConfirmationResultPopupComponent;
  @ViewChild(DocumentsOrdresPopupComponent) docsPopup: DocumentsOrdresPopupComponent;
  @ViewChild(FileManagerComponent) fileManagerComponent: FileManagerComponent;

  constructor(
    private fb: FormBuilder,
    public litigesService: LitigesService,
    public ordresService: OrdresService,
    public localization: LocalizationService,
    public currentCompanyService: CurrentCompanyService,
    public litigesLignesService: LitigesLignesService,
    public envoisService: EnvoisService,
    public fluxEnvoisService: FluxEnvoisService,
  ) { }

  ngOnChanges() {
    if (this.ordre) {
      this.currOrdre = this.ordre;
      // this.disableCreate =
      //   Statut[this.ordre.statut] === Statut.ANNULE.toString()
      //   && this.ordre.factureAvoir.toString() === "FACTURE";
    }
  }

  ngOnInit() {
    this.ordres = this.ordresService.getDataSource_v2(["id"]);
    this.ordres.filter([
      ["valide", "=", true],
      "and",
      ["societe.id", "=", this.currentCompanyService.getCompany().id],
    ]);
    this.columns = [
      "id",
      "ordreAvoirFournisseur.numero",
      "dateCreation",
      "dateAvoirClient",
      "dateAvoirFournisseur",
      "referenceClient",
      "clientCloture",
      "fournisseurCloture",
      "clientValideAdmin",
      "fournisseurValideAdmin",
      "commentairesInternes",
      "ordreAvoirClient.numero",
      "fraisAnnexes",
      "totalMontantRistourne",
    ];
  }

  loadForm() {
    if (this.ordre?.id) {
      const ds = this.litigesService.getDataSource_v2(this.columns);
      ds.filter(["ordreOrigine.id", "=", this.ordre.id]);
      ds.load().then((res) => {
        if (res.length) {
          this.noLitiges = false;
          this.formGroup.patchValue(res[0]);
          this.infosLitige = {
            litige: { id: res[0].id },
            clientClos: res[0].clientCloture,
            fournisseurClos: res[0].fournisseurCloture,
            fraisAnnexes: res[0].fraisAnnexes
          };
          this.noFraisAnnexes = !this.infosLitige.fraisAnnexes;
          this.litigeClosed = this.infosLitige.clientClos && this.infosLitige.fournisseurClos;
          from(this.litigesLignesService.getTotaux(res[0].id))
            .pipe(mergeAll())
            .subscribe((result) => {
              const totaux: LitigeLigneTotaux & {
                resultat?: number;
              } = result.data.litigeLigneTotaux;
              if (totaux) {
                totaux.resultat =
                  totaux.avoirFournisseur -
                  totaux.avoirClient -
                  totaux.fraisAnnexes;
                this.devise = totaux.devise.id;
                this.resultat.value = totaux.resultat;
                if (totaux.totalMontantRistourne)
                  this.totalMontantRistourne = true;
                this.formGroup.patchValue(totaux);
              }
            });
        } else {
          this.noLitiges = true;
        }
      });
    }
  }

  createLitige() {
    if (Statut[this.ordre.statut] !== Statut.ANNULE.toString()) {
      if (this.ordre.factureAvoir.toString() === "FACTURE") {

        this.litigesService.ofChronoLitige(this.ordre.id).pipe(
          concatMap(res => this.litigesService.ofLitigeCtlClientInsert(
            this.currentCompanyService.getCompany().id,
            this.ordre.id,
            res.data.ofChronoLitige.data.is_cur_lit_ref,
          )),
        )
          .subscribe({
            next: res => {
              this.loadForm();
              this.selectLignesPopup.visible = true;
            },
            error: err => notify(err.message, "error", 3000),
          });

      } else {
        notify(this.localization.localize("ordres-litiges-warn-no-facture"), "warning", 3500);
      }
    } else {
      notify(this.localization.localize("ordres-litiges-warn-cancelled-order"), "warning", 3500);
    }

  }

  assignLitigeLignes(e) {
    this.gestionOpPopup.lot = [this.infosLitige.litige.id, null];
    this.gestionOpPopup.visible = true;
  }

  saveLitige() {
    const persistedFields = [
      "id",
      "referenceClient",
      "commentairesInternes",
    ];
    this.litigesService.save(
      new Set(persistedFields),
      {
        id: this.infosLitige.litige.id,
        ...persistedFields
          .map(field => ({ [field]: this.formGroup.get(field).value }))
          .reduce((acm, crt) => ({ ...acm, ...crt })),
      }).pipe(
        concatMap(res => this.litigesService.ofSauveLitige(res.data.saveLitige.id)),
      ).subscribe({
        next: () => this.loadForm(),
        complete: () => notify(this.localization.localize("litige-save-success"), "success", 3500),
        error: err => notify(err.message, "error", 3000),
      });
  }

  incidentLitige() {
    this.saveLitige();
    this.handleFlux("INCLIT");
  }

  avisResolution() {
    this.saveLitige();
    this.handleFlux("RESLIT");
  }

  recapInterne() {
    this.saveLitige();
    this.fluxEnvoisService.pushDepotEnvoi("RECINT", this.ordre.id);
  }

  creerLot() {
    this.selectLignesPopup.visible = true;
  }

  modifierLot() {
    iif(() => !!this.selectedLitigeLigneKey,
      this.litigesLignesService
        .getOne_v2(this.selectedLitigeLigneKey, new Set(["id", "numeroGroupementLitige"]))
        .pipe(map(res => res.data.litigeLigne.numeroGroupementLitige)),
      of(""))
      .subscribe({
        next: numRegroupement => this.gestionOpPopup.lot = [this.infosLitige.litige.id, numRegroupement],
        complete: () => this.gestionOpPopup.visible = true,
      });
  }

  fraisAnnexes() {
    this.litigeID = this.infosLitige.litige.id;
    this.fraisAnnexesPopup.visible = true;
  }

  async cloturer() {

    if (!this.infosLitige?.fraisAnnexes) {
      if (await confirm(
        this.localization.localize("ask-cloture-frais-zero"),
        this.localization.localize("btn-close"))) {
        this.cloturePopup.visible = true;
      }
    } else {
      this.cloturePopup.visible = true;
    }
  }

  onToggling(toggled: boolean) {
    if (toggled) this.loadForm();
  }

  onClotureChanged() {
    // refresh the form
    this.loadForm();
  }

  private handleFlux(flux: Flux["id"]) {
    this.fluxEnvoisService.prompt(flux, this.ordre.id, this.envoisFluxWarningPopup).pipe(
      filter(res => res),
    ).subscribe(res => {
      this.docsPopup.setTitle();
      this.docsPopup.titleEnd = `${this.ordre.numero} - ${this.localization.localize("tiers-contacts-flux")} ${flux}`;
      this.docsPopup.ordre = this.ordre;
      this.docsPopup.flux = flux;
      this.docsPopup.visible = true;
    });
  }

  public openAssociatedDocsPopup() {
    this.fileManagerComponent.visible = true;
  }

  public whenUpdated(dataMutated) {
    this.loadForm();
    if (dataMutated) this.incidentLitige();
  }
}
