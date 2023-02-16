import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormBuilder } from "@angular/forms";
import LitigeLigneTotaux from "app/shared/models/litige-ligne-totaux.model";
import Litige from "app/shared/models/litige.model";
import { Ordre, Statut } from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import { LitigesService } from "app/shared/services/api/litiges.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DxNumberBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { from } from "rxjs";
import { confirm, alert } from "devextreme/ui/dialog";
import { mergeAll } from "rxjs/operators";
import { LitigeCloturePopupComponent } from "../indicateurs/litiges/litige-cloture-popup/litige-cloture-popup.component";
import { SelectionLignesLitigePopupComponent } from "../selection-lignes-litige-popup/selection-lignes-litige-popup.component";
import { FraisAnnexesLitigePopupComponent } from "./frais-annexes-litige-popup/frais-annexes-litige-popup.component";
import notify from "devextreme/ui/notify";

@Component({
  selector: "app-form-litiges",
  templateUrl: "./form-litiges.component.html",
  styleUrls: ["./form-litiges.component.scss"],
})
export class FormLitigesComponent implements OnInit, OnChanges {
  @Input() public ordre: Ordre;
  @Input() public gridCdeHasRows: boolean;
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

  constructor(
    private fb: FormBuilder,
    public litigesService: LitigesService,
    public ordresService: OrdresService,
    public localization: LocalizationService,
    public currentCompanyService: CurrentCompanyService,
    public litigesLignesService: LitigesLignesService,
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

  showForm() {
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
              totaux.resultat =
                totaux.avoirFournisseur -
                totaux.avoirClient -
                totaux.fraisAnnexes;
              this.devise = totaux.devise.id;
              this.resultat.value = totaux.resultat;
              if (totaux.totalMontantRistourne)
                this.totalMontantRistourne = true;
              this.formGroup.patchValue(totaux);
            });
        } else {
          this.noLitiges = true;
        }
      });
    }
  }

  createLitige() {
    //////////////////////////////////////
    // Fonction à implémenter
    //////////////////////////////////////

    if (Statut[this.ordre.statut] !== Statut.ANNULE.toString()) {
      if (this.ordre.factureAvoir.toString() === "FACTURE") {

        // of_sauve_litige();
        // of_chrono_litige(1)
        // of_litige_ctl_client_insert()

        this.selectLignesPopup.visible = true;

      } else {
        notify(this.localization.localize("ordres-litiges-warn-no-facture"), "warning", 3500);
      }
    } else {
      notify(this.localization.localize("ordres-litiges-warn-cancelled-order"), "warning", 3500);
    }

  }

  assignLitigeLignes(e) {
    console.log(e);
    //////////////////////////////////////
    // Fonction à implémenter
    //////////////////////////////////////
  }

  saveLitige() {
    //////////////////////////////////////
    // Fonction à implémenter
    //////////////////////////////////////
  }

  incidentLitige() {
    //////////////////////////////////////
    // Fonction à implémenter
    //////////////////////////////////////
  }

  avisResolution() {
    //////////////////////////////////////
    // Fonction à implémenter
    //////////////////////////////////////
  }

  recapInterne() {
    //////////////////////////////////////
    // Fonction à implémenter
    //////////////////////////////////////
  }

  creerLot() {
    //////////////////////////////////////
    // Fonction à implémenter
    //////////////////////////////////////
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
    if (toggled) this.showForm();
  }
}
