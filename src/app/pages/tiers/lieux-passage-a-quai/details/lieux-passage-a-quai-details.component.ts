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
    valide: [false]
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };
  contentReadyEvent = new EventEmitter<any>();
  @ViewChild(EditingAlertComponent, { static: true }) alertComponent: EditingAlertComponent;
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
  }

  ngOnInit() {

    this.route.params
    .pipe(tap( _ => this.formGroup.reset()))
    .subscribe(params => {
      this.createMode = this.route.snapshot.url[0].path === 'create';
      this.readOnlyMode = !this.createMode;
      if (!this.createMode) {
        this.lieupassageaquaiService
          .getOne(params.id)
          .subscribe( res => {
            this.lieupassageaquai = res.data.lieuPassageAQuai;
            this.formGroup.patchValue(this.lieupassageaquai);
            this.contentReadyEvent.emit();
          });
      } else {
        this.lieupassageaquai = new LieuPassageAQuai({});
        this.contentReadyEvent.emit();
        console.log('hi')
      }
    });

    this.pays = this.paysService.getDataSource();
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.devises = this.devisesService.getDataSource();
    this.moyensPaiement = this.moyensPaiementService.getDataSource();
    this.basesPaiement = this.basesPaiementService.getDataSource();
  }

  checkCode(params) {
      const code = params.value.toUpperCase();
      const lieuxpassageaquaiSource = this.lieupassageaquaiService.getDataSource({ search: `id=="${ code }"` });
      return lieuxpassageaquaiSource.load().then(res => !(res.length));
  }

  onSubmit() {

    if (!this.formGroup.pristine && this.formGroup.valid) {
      const lieuPassageAQuai = this.lieupassageaquaiService.extractDirty(this.formGroup.controls);

      if (this.createMode) {
        lieuPassageAQuai.id = this.formGroup.get('id').value.toUpperCase();
          // Ici on fait rien pour le moment l'id est deja dans l'object lieupassageaquai
          // Avoir pour les valeur par defaut (qui sont not null dans la base)
      } else {
        lieuPassageAQuai.id = this.lieupassageaquai.id;
      }

      this.lieupassageaquaiService
      .save({ lieuPassageAQuai })
        .subscribe({
          next: () => {
            notify('Sauvegardé', 'success', 3000);
            if (!this.createMode) {
              this.lieupassageaquai = { id: this.lieupassageaquai.id, ...this.formGroup.getRawValue() };
              this.readOnlyMode = true;
            } else {
              this.router.navigate([`/tiers/lieux-passage-a-quai/${lieuPassageAQuai.id}`]);
            }
          },
          error: () => notify('Echec de la sauvegarde', 'error', 3000),
        });
      }

  }

  onCancel() {
    if (!this.createMode) {
      this.formGroup.reset(this.formGroup);
      this.readOnlyMode = true;
    } else {
      this.router.navigate([`/tiers/lieux-passage-a-quai`]);
    }
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/${ this.lieupassageaquai.id }/${ this.lieupassageaquai.typeTiers }`]);
  }

}
