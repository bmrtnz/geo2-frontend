import { Component, OnInit, AfterViewInit, EventEmitter, ViewChild } from '@angular/core';
import { LieuxPassageAQuaiService } from '../../../../shared/services/lieux-passage-a-quai.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LieuPassageAQuai } from '../../../../shared/models';
import { FormBuilder } from '@angular/forms';
import { RegimesTvaService } from 'app/shared/services/regimes-tva.service';
import { DevisesService } from 'app/shared/services/devises.service';
import { MoyensPaiementService } from 'app/shared/services/moyens-paiement.service';
import { BasesPaiementService } from 'app/shared/services/bases-paiement.service';
import { PaysService } from 'app/shared/services/pays.service';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { NestedPart } from 'app/pages/nested/nested.component';
import { Editable } from 'app/shared/guards/editing-guard';
import { EditingAlertComponent } from 'app/shared/components/editing-alert/editing-alert.component';
import { tap } from 'rxjs/operators';
import { FileManagerComponent } from 'app/shared/components/file-manager/file-manager-popup.component';

@Component({
  selector: 'app-lieux-passage-a-quai-details',
  templateUrl: './lieux-passage-a-quai-details.component.html',
  styleUrls: ['./lieux-passage-a-quai-details.component.scss']
})
export class LieuxPassageAQuaiDetailsComponent implements OnInit, AfterViewInit, NestedPart, Editable {

  formGroup = this.fb.group({
    id: [''],
    raisonSocial: [''],
    pays: [''],
    adresse1: [''],
    adresse2: [''],
    adresse3: [''],
    ville: [''],
    codePostal: [''],
    lieuFonctionEan: [''],
    langue: [''],
    tvaCee: [''],
    nbJourEcheance: [''],
    echeanceLe: [''],
    regimeTva: [''],
    devise: [''],
    moyenPaiement: [''],
    basePaiement: [''],
    contacts: [''],
    valide: [false],
    preSaisie: ['']
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };
  contentReadyEvent = new EventEmitter<any>();
  refreshGrid = new EventEmitter();
  @ViewChild(EditingAlertComponent, { static: true }) alertComponent: EditingAlertComponent;
  @ViewChild(FileManagerComponent, { static: false }) fileManagerComponent: FileManagerComponent;
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
  preSaisie: string;

  constructor(
    private fb: FormBuilder,
    private lieupassageaquaiService: LieuxPassageAQuaiService,
    private regimesTvaService: RegimesTvaService,
    private devisesService: DevisesService,
    private moyensPaiementService: MoyensPaiementService,
    private basesPaiementService: BasesPaiementService,
    private paysService: PaysService,
    private router: Router,
    private route: ActivatedRoute,
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
      const Element = document.querySelector('.submit') as HTMLElement;
      Element.click();
    }
  }

  ngOnInit() {

    this.route.params
    .pipe(tap( _ => this.formGroup.reset()))
    .subscribe(async params => {
      const url = this.route.snapshot.url;
      this.createMode = url[url.length - 1].path === 'create';
      this.readOnlyMode = !this.createMode;
      if (!this.createMode) {
        (await this.lieupassageaquaiService
          .getOne(params.id))
          .subscribe( res => {
            this.lieupassageaquai = res.data.lieuPassageAQuai;
            this.formGroup.patchValue(this.lieupassageaquai);
            this.contentReadyEvent.emit();
            this.preSaisie = this.lieupassageaquai.preSaisie === true ? 'preSaisie' : '';
          });
      } else {
        this.lieupassageaquai = new LieuPassageAQuai({});
        this.contentReadyEvent.emit();
      }
    });

    this.pays = this.paysService.getDataSource();
    this.pays.filter(['valide', '=', 'true']);
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.devises = this.devisesService.getDataSource();
    this.moyensPaiement = this.moyensPaiementService.getDataSource();
    this.basesPaiement = this.basesPaiementService.getDataSource();
  }

  checkCode(params) {
      const code = params.value.toUpperCase();
      const lieuxpassageaquaiSource = this.lieupassageaquaiService.getDataSource();
      lieuxpassageaquaiSource.filter(['id', '=', code]);
      return lieuxpassageaquaiSource.load().then(res => !(res.length));
  }

  async onSubmit() {

    if (!this.formGroup.pristine && this.formGroup.valid) {
      const lieuPassageAQuai = this.lieupassageaquaiService.extractDirty(this.formGroup.controls);

      if (this.createMode) {
        lieuPassageAQuai.id = this.formGroup.get('id').value.toUpperCase();
          // Ici on fait rien pour le moment l'id est deja dans l'object lieupassageaquai
          // Avoir pour les valeur par defaut (qui sont not null dans la base)
        lieuPassageAQuai.valide = false;
        lieuPassageAQuai.preSaisie = true;
      } else {
        if (lieuPassageAQuai.valide === true) {
          lieuPassageAQuai.preSaisie = false;
          this.preSaisie = '';
        }
        lieuPassageAQuai.id = this.lieupassageaquai.id;
      }

      (await this.lieupassageaquaiService
      .save({ lieuPassageAQuai }))
        .subscribe({
          next: () => {
            notify('Sauvegardé', 'success', 3000);
            this.refreshGrid.emit();
            if (!this.createMode) {
              this.lieupassageaquai = { id: this.lieupassageaquai.id, ...this.formGroup.getRawValue() };
              this.readOnlyMode = true;
            } else {
              this.editing = false;
              this.router.navigate([`/tiers/lieux-passage-a-quai/${lieuPassageAQuai.id}`]);
            }
          },
          error: () => notify('Echec de la sauvegarde', 'error', 3000),
        });
      }

  }

  onCancel() {
    if (!this.createMode) {
      this.formGroup.reset(this.lieupassageaquai);
      this.readOnlyMode = true;
    } else {
      this.router.navigate([`/tiers/lieux-passage-a-quai`]);
    }
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  fileManagerClick() {
    this.fileManagerComponent.visible = true;
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/${ this.lieupassageaquai.id }/${ this.lieupassageaquai.typeTiers }`]);
  }

}
