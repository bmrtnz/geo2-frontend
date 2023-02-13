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
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import { LitigesService } from "app/shared/services/api/litiges.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DxNumberBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { from } from "rxjs";
import { mergeAll } from "rxjs/operators";
import { LitigeCloturePopupComponent } from "../indicateurs/litiges/litige-cloture-popup/litige-cloture-popup.component";
import { FraisAnnexesLitigePopupComponent } from "./frais-annexes-litige-popup/frais-annexes-litige-popup.component";

@Component({
  selector: "app-form-litiges",
  templateUrl: "./form-litiges.component.html",
  styleUrls: ["./form-litiges.component.scss"],
})
export class FormLitigesComponent implements OnInit, OnChanges {
  @Input() public ordre: Ordre;
  @Output() public ordreSelected = new EventEmitter<Litige>();
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

  litigesData: any;
  ordres: DataSource;
  noLitiges = null;
  devise = "EUR";
  ddeAvoirFournisseur: any;
  totalMontantRistourne: any;
  disableCreate: boolean;
  columns: any;

  @ViewChild("resultat", { static: false }) resultat: DxNumberBoxComponent;
  @ViewChild(LitigeCloturePopupComponent, { static: false }) cloturePopup: LitigeCloturePopupComponent;
  @ViewChild(FraisAnnexesLitigePopupComponent, { static: false }) fraisAnnexesPopup: FraisAnnexesLitigePopupComponent;

  constructor(
    private fb: FormBuilder,
    public litigesService: LitigesService,
    public ordresService: OrdresService,
    public currentCompanyService: CurrentCompanyService,
    public litigesLignesService: LitigesLignesService,
  ) { }

  ngOnChanges() {
    if (this.ordre) {
      this.disableCreate =
        Statut[this.ordre.statut] === Statut.ANNULE.toString()
        && this.ordre.factureAvoir.toString() === "FACTURE";
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
          this.litigesData = res[0];
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
    this.litigeID = this.litigesData.id;
    this.fraisAnnexesPopup.visible = true;
    //////////////////////////////////////
    // Affichage Popup
    //////////////////////////////////////
  }

  cloturer() {
    this.infosLitige = {
      litige: { id: this.litigesData.id },
      clientClos: this.litigesData.clientCloture,
      fournisseurClos: this.litigesData.fournisseurClos
    };
    this.cloturePopup.visible = true;
  }

  onToggling(toggled: boolean) {
    if (toggled) this.showForm();
  }
}
