import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
} from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NestedPart } from "app/pages/nested/nested.component";
import { EditingAlertComponent } from "app/shared/components/editing-alert/editing-alert.component";
import { FileManagerComponent } from "app/shared/components/file-manager/file-manager-popup.component";
import { ModificationListComponent } from "app/shared/components/modification-list/modification-list.component";
import { Editable } from "app/shared/guards/editing-guard";
import { LieuPassageAQuai } from "app/shared/models";
import { AuthService } from "app/shared/services";
import { BasesPaiementService } from "app/shared/services/api/bases-paiement.service";
import { DevisesService } from "app/shared/services/api/devises.service";
import { LieuxPassageAQuaiService } from "app/shared/services/api/lieux-passage-a-quai.service";
import { ModificationsService } from "app/shared/services/api/modification.service";
import { MoyensPaiementService } from "app/shared/services/api/moyens-paiement.service";
import { PaysService } from "app/shared/services/api/pays.service";
import { RegimesTvaService } from "app/shared/services/api/regimes-tva.service";
import { ValidationService } from "app/shared/services/api/validation.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import gridsConfig from "assets/configurations/grids.json";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { tap } from "rxjs/operators";

@Component({
  selector: "app-lieux-passage-a-quai-details",
  templateUrl: "./lieux-passage-a-quai-details.component.html",
  styleUrls: ["./lieux-passage-a-quai-details.component.scss"],
})
export class LieuxPassageAQuaiDetailsComponent
  implements OnInit, OnChanges, AfterViewInit, NestedPart, Editable {
  @Input() public lieupassageaquaiLigneId: string;
  @Input() public lieupassageaquaiTitle: string;


  formGroup = this.fb.group({
    id: [""],
    raisonSocial: [""],
    pays: [""],
    adresse1: [""],
    adresse2: [""],
    adresse3: [""],
    ville: [""],
    codePostal: [""],
    lieuFonctionEan: [""],
    langue: [""],
    tvaCee: [""],
    nbJourEcheance: [""],
    echeanceLe: [""],
    regimeTva: [""],
    devise: [""],
    moyenPaiement: [""],
    basePaiement: [""],
    compteComptable: [""],
    contacts: [""],
    valide: [false],
    preSaisie: [""],
  });
  helpBtnOptions = {
    icon: "help",
    elementAttr: { id: "help-1" },
    onClick: () => this.toggleVisible(),
  };
  contentReadyEvent = new EventEmitter<any>();
  refreshGrid = new EventEmitter();
  @ViewChild(EditingAlertComponent, { static: true })
  alertComponent: EditingAlertComponent;
  @ViewChild(FileManagerComponent, { static: false })
  fileManagerComponent: FileManagerComponent;
  @ViewChild(ModificationListComponent, { static: false })
  modifListe: ModificationListComponent;
  editing = false;

  lieupassageaquai: LieuPassageAQuai;
  code: string;
  pays: DataSource;
  devises: DataSource;
  moyensPaiement: DataSource;
  basesPaiement: DataSource;
  regimesTva: DataSource;
  bureauxAchat: DataSource;
  typeLieupassageaquai: any[];
  defaultVisible: boolean;
  isReadOnlyMode = true;
  createMode = false;
  CCexists = false;
  preSaisie: string;
  public printDocumentTitle: string;


  constructor(
    private fb: UntypedFormBuilder,
    public formUtils: FormUtilsService,
    private lieupassageaquaiService: LieuxPassageAQuaiService,
    private regimesTvaService: RegimesTvaService,
    private devisesService: DevisesService,
    private modificationsService: ModificationsService,
    private moyensPaiementService: MoyensPaiementService,
    private basesPaiementService: BasesPaiementService,
    public validationService: ValidationService,
    private paysService: PaysService,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService
  ) {
    this.defaultVisible = false;
    this.checkCode = this.checkCode.bind(this);
  }

  get readOnlyMode() {
    return this.isReadOnlyMode;
  }
  set readOnlyMode(value: boolean) {
    this.editing = !value;
    this.isReadOnlyMode = value;
  }

  ngAfterViewInit(): void {
    this.formGroup.reset(this.lieupassageaquai);
    // Seule solution valable pour le moment pour faire apparaitre les warnings. A revoir...
    if (this.createMode) {
      const Element = document.querySelector(".submit") as HTMLElement;
      Element.click();
    }
  }

  ngOnInit() {
    this.pays = this.paysService.getDataSource_v2(["id", "description"]);
    this.pays.filter(["valide", "=", "true"]);
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.regimesTva.filter(["valide", "=", "true"]);
    this.devises = this.devisesService.getDataSource();
    this.devises.filter(["valide", "=", "true"]);
    this.moyensPaiement = this.moyensPaiementService.getDataSource();
    this.moyensPaiement.filter(["valide", "=", "true"]);
    this.basesPaiement = this.basesPaiementService.getDataSource();
    this.basesPaiement.filter(["valide", "=", "true"]);

    if (this.route.snapshot.url[1]?.path !== "lieux-passage-a-quai") return;

    this.route.params
      .pipe(tap((_) => this.formGroup.reset()))
      .subscribe((params) => {
        const url = this.route.snapshot.url;
        this.createMode = url[url.length - 1].path === "create";
        this.readOnlyMode = !this.createMode;
        if (!this.createMode) {
          this.lieupassageaquaiService.getOne(params.id).subscribe((res) => {
            this.afterLoadInitForm(res);
          });
        } else {
          this.lieupassageaquai = new LieuPassageAQuai({});
          this.contentReadyEvent.emit();
        }
      });
  }

  ngOnChanges() {
    // Zoom fournisseur mode when clicking on an order article
    if (this.lieupassageaquaiLigneId) {
      this.formGroup.reset();
      this.preSaisie = "";
      this.lieupassageaquaiService
        .getOne(this.lieupassageaquaiLigneId)
        .subscribe((res) => this.afterLoadInitForm(res));
    }
  }

  afterLoadInitForm(res) {
    this.lieupassageaquai = res.data.lieuPassageAQuai;
    this.printDocumentTitle = `Fiche-lieu-pass-quai-${this.lieupassageaquai?.id}`;
    this.formGroup.patchValue(this.lieupassageaquai);
    this.contentReadyEvent.emit();
    this.preSaisie =
      this.lieupassageaquai.preSaisie === true ? "preSaisie" : "";
  }

  checkCode(params) {
    const code = params.value.toUpperCase();
    const lieuxpassageaquaiSource =
      this.lieupassageaquaiService.getDataSource_v2(["id"]);
    lieuxpassageaquaiSource.filter(["id", "=", code]);
    return lieuxpassageaquaiSource.load().then((res) => !res.length);
  }

  checkCompteComptable(e) {
    const compteComptable = this.valueToUpperCase(e);
    if (!compteComptable) return;
    const lieuxpassageaquaiSource =
      this.lieupassageaquaiService.getDataSource_v2(["compteComptable"]);
    lieuxpassageaquaiSource.filter(["compteComptable", "=", compteComptable]);
    lieuxpassageaquaiSource.load().then((res) => (this.CCexists = res.length));
  }

  onNonRequiredSBChange(e) {
    if (this.editing && e.value === null) {
      this.formUtils.setIdToNull(
        this.formGroup,
        e.element.attributes.formcontrolname.nodeValue
      );
    }
  }

  onCodeChange(e) {
    if (!e.value) return;
    const code = e.value.toUpperCase();
    this.formGroup.get("id").setValue(code);
    if (code.length && this.createMode) {
      this.formGroup.get("compteComptable").markAsDirty();
      this.formGroup.get("compteComptable").setValue(code);
    }
  }

  valueToUpperCase(e) {
    if (!e.component.option("value")) return;
    e.component.option("value", e.component.option("value").toUpperCase());
    return e.component.option("value");
  }

  displayIDBefore(data) {
    return data
      ? data.id +
      " - " +
      (data.nomUtilisateur
        ? data.nomUtilisateur
        : data.raisonSocial
          ? data.raisonSocial
          : data.description)
      : null;
  }

  onSubmit() {
    if (!this.formGroup.pristine && this.formGroup.valid) {
      // 05-2022: Lea/Stéphane wants to avoid pre-saisie/modifications step
      this.formGroup.get("preSaisie").setValue(false);
      this.formGroup.get("preSaisie").markAsDirty();
      this.preSaisie = "";

      const lieuPassageAQuai = this.formUtils.extractDirty(
        this.formGroup.controls,
        LieuPassageAQuai.getKeyField()
      );

      if (this.createMode) {
        lieuPassageAQuai.valide = true;
      } else {
        lieuPassageAQuai.id = this.lieupassageaquai.id;
      }
      this.saveData(lieuPassageAQuai);
    }
  }

  saveData(lieuPassageAQuai) {
    this.lieupassageaquaiService
      .save_v2(this.getDirtyFieldsPath(), { lieuPassageAQuai })
      .subscribe({
        next: (e) => {
          if (this.createMode || this.authService.currentUser.adminClient)
            notify("Sauvegardé", "success", 3000);
          this.refreshGrid.emit();
          // Show red badges (unvalidated forms)
          this.validationService.showToValidateBadges();
          if (!this.createMode) {
            this.lieupassageaquai = {
              ...this.lieupassageaquai,
              ...this.formGroup.getRawValue(),
            };
            this.readOnlyMode = true;
          } else {
            this.editing = false;
            this.router.navigate([
              `/pages/tiers/lieux-passage-a-quai/${e.data.saveLieuPassageAQuai.id}`,
            ]);
          }
          this.lieupassageaquai.typeTiers =
            e.data.saveLieuPassageAQuai.typeTiers;
          this.formGroup.markAsPristine();
        },
        error: () => notify("Échec de la sauvegarde", "error", 3000),
      });
  }

  saveAfterModification(info?) {
    if (this.authService.currentUser.adminClient) {
      const lieuPassageAQuai = {
        id: this.lieupassageaquai.id,
        preSaisie: !info.last,
      };
      this.lieupassageaquaiService
        .save_v2(["id", "preSaisie"], {
          lieuPassageAQuai,
        })
        .subscribe({
          next: () => {
            this.refreshGrid.emit();
            this.formGroup.markAsPristine();
            if (info.last) this.preSaisie = "";
            this.validationService.showToValidateBadges();
          },
          error: (err) => {
            console.log(err);
            notify("Échec de la sauvegarde", "error", 3000);
          },
        });
    }
  }

  onCancel() {
    if (!this.createMode) {
      this.formGroup.reset(this.lieupassageaquai);
      this.readOnlyMode = true;
    } else {
      this.router.navigate([`/pages/tiers/lieux-passage-a-quai`]);
    }
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  fileManagerClick() {
    this.fileManagerComponent.visible = true;
  }

  contactsBtnClick() {
    this.router.navigate([
      `/pages/tiers/contacts/${this.lieupassageaquai.id}/${this.lieupassageaquai.typeTiers}`,
    ]);
  }

  private getDirtyFieldsPath() {
    const dirtyFields = this.formUtils.extractDirty(
      this.formGroup.controls,
      LieuPassageAQuai.getKeyField()
    );
    const gridFields = gridsConfig["lieu-passage-a-quai"].columns.map(
      ({ dataField }) => dataField
    );

    return [...this.formUtils.extractPaths(dirtyFields), ...gridFields];
  }
}
