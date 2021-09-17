import { AfterViewInit, Component, EventEmitter, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NestedPart } from 'app/pages/nested/nested.component';
import { InfoPopupComponent } from 'app/shared/components/info-popup/info-popup.component';
import { EditingAlertComponent } from 'app/shared/components/editing-alert/editing-alert.component';
import { FileManagerComponent } from 'app/shared/components/file-manager/file-manager-popup.component';
import { Editable } from 'app/shared/guards/editing-guard';
import { AuthService, ClientsService } from 'app/shared/services';
import { BasesPaiementService } from 'app/shared/services/api/bases-paiement.service';
import { DevisesService } from 'app/shared/services/api/devises.service';
import { MoyensPaiementService } from 'app/shared/services/api/moyens-paiement.service';
import { PaysService } from 'app/shared/services/api/pays.service';
import { RegimesTvaService } from 'app/shared/services/api/regimes-tva.service';
import { DxAccordionComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { tap } from 'rxjs/operators';
import { Transporteur } from '../../../../shared/models';
import { TransporteursService } from '../../../../shared/services/api/transporteurs.service';

@Component({
  selector: 'app-transporteur-details',
  templateUrl: './transporteur-details.component.html',
  styleUrls: ['./transporteur-details.component.scss']
})
export class TransporteurDetailsComponent implements OnInit, AfterViewInit, NestedPart, Editable {

  formGroup = this.fb.group({
    id: [''],
    raisonSocial: [''],
    adresse1: [''],
    adresse2: [''],
    adresse3: [''],
    codePostal: [''],
    ville: [''],
    pays: [''],
    regimeTva: [''],
    nbJourEcheance: [''],
    echeanceLe: [''],
    moyenPaiement: [''],
    tvaCee: [''],
    clientRaisonSocial: [''],
    basePaiement: [''],
    compteComptable: [''],
    langue: [''],
    devise: [''],
    lieuFonctionEan: [''],
    valide: [false],
    preSaisie: ['']
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };
  contentReadyEvent = new EventEmitter<any>();
  refreshGrid = new EventEmitter();
  @ViewChild(EditingAlertComponent, { static: true }) alertComponent: EditingAlertComponent;
  @ViewChild(InfoPopupComponent, { static: true }) infoComponent: InfoPopupComponent;
  @ViewChild(FileManagerComponent, { static: false }) fileManagerComponent: FileManagerComponent;
  @ViewChildren(DxAccordionComponent) accordion: any;
  editing = false;

  transporteur: Transporteur;
  code: string;
  pays: DataSource;
  devises: DataSource;
  moyensPaiement: DataSource;
  basesPaiement: DataSource;
  clientsRaisonSocial: DataSource;
  regimesTva: DataSource;
  bureauxAchat: DataSource;
  typesTransporteur: DataSource;
  clients: DataSource;
  defaultVisible: boolean;
  isReadOnlyMode = true;
  createMode = false;
  preSaisie: string;
  CCexists = false;

  constructor(
    private fb: FormBuilder,
    private transporteursService: TransporteursService,
    private regimesTvaService: RegimesTvaService,
    private devisesService: DevisesService,
    private moyensPaiementService: MoyensPaiementService,
    private basesPaiementService: BasesPaiementService,
    private paysService: PaysService,
    private clientsService: ClientsService,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
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
    // Ouverture ou fermeture accordéons (création)
    this.openCloseAccordions(this.createMode);
    this.formGroup.reset(this.transporteur);
    // Seule solution valable pour le moment pour faire apparaitre les warnings. A revoir...
    if (this.createMode) {
      const Element = document.querySelector('.submit') as HTMLElement;
      Element.click();
    }
  }

  ngOnInit() {

    this.route.params
      .pipe(tap(_ => this.formGroup.reset()))
      .subscribe(params => {
        const url = this.route.snapshot.url;
        this.createMode = url[url.length - 1].path === 'create';
        this.readOnlyMode = !this.createMode;
        if (!this.createMode) {
          this.transporteursService.getOne(params.id)
            .subscribe(res => {
              this.transporteur = res.data.transporteur;
              this.formGroup.patchValue(this.transporteur);
              this.contentReadyEvent.emit();
              this.preSaisie = this.transporteur.preSaisie === true ? 'preSaisie' : '';
            });
        } else {
          this.transporteur = new Transporteur({});
          this.contentReadyEvent.emit();
        }
      });

    this.pays = this.paysService.getDataSource();
    this.pays.filter(['valide', '=', 'true']);
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.devises = this.devisesService.getDataSource();
    this.moyensPaiement = this.moyensPaiementService.getDataSource();
    this.basesPaiement = this.basesPaiementService.getDataSource();
    this.clientsRaisonSocial = this.clientsService.getDataSource();

  }

  checkCode(params) {
    const code = params.value.toUpperCase();
    const transporteursSource = this.transporteursService.getDataSource();
    transporteursSource.filter(['id', '=', code]);
    return transporteursSource.load().then(res => !(res.length));
  }

  checkCompteComptable(e) {
    const compteComptable = e.value;
    if (!compteComptable) return;
    const transporteursSource = this.transporteursService.getDataSource();
    transporteursSource.filter(['compteComptable', '=', compteComptable]);
    transporteursSource.load().then(res => res.length ? this.CCexists = true : this.CCexists = false);
  }

  openCloseAccordions(action) {
    if (!this.accordion) return;
    this.accordion.toArray().forEach(element => {
      if (action) {
        element.instance.expandItem(0);
      } else {
        element.instance.collapseItem(0);
      }
    });
  }

  onCodeChange(e) {
    if (!e.value) return;
    const code = e.value.toUpperCase();
    this.formGroup.get('id').setValue(code);
    if (code.length && this.createMode) {
      this.formGroup.get('compteComptable').markAsDirty()
      this.formGroup.get('compteComptable').setValue(code);
    }
  }

  displayIDBefore(data) {
    return data ? (data.id + ' ' + (data.nomUtilisateur ? data.nomUtilisateur : (data.raisonSocial ? data.raisonSocial : data.description))) : null;
  }

  onSubmit() {

    if (!this.formGroup.pristine && this.formGroup.valid) {
      const transporteur = this.transporteursService.extractDirty(this.formGroup.controls);

      if (this.createMode) {

        this.infoComponent.visible = true;
        this.infoComponent.doNavigate.subscribe(res => {
          if (res) {
            transporteur.id = this.formGroup.get('id').value.toUpperCase();
            // Ici on fait rien pour le moment l'id est deja dans l'object lieupassageaquai
            // Avoir pour les valeur par defaut (qui sont not null dans la base)
            transporteur.preSaisie = true;
            transporteur.valide = false;
            this.saveData(transporteur);
          }
        });
      } else {
        if (transporteur.valide === true) {
          transporteur.preSaisie = false;
          this.preSaisie = '';
        }
        transporteur.id = this.transporteur.id;
        this.saveData(transporteur);
      }

    }
  }

  saveData(transporteur) {

    this.transporteursService.save({ transporteur })
    .subscribe({
      next: (e) => {
        notify('Sauvegardé', 'success', 3000);
        this.refreshGrid.emit();
        if (!this.createMode) {
          this.transporteur = {
            ...this.transporteur,
            ...this.formGroup.getRawValue(),
          };
          this.readOnlyMode = true;
        } else {
          this.editing = false;
          this.router.navigate([`/tiers/transporteurs/${e.data.saveTransporteur.id}`]);
        }
        this.transporteur.typeTiers = e.data.saveTransporteur.typeTiers;
        this.formGroup.markAsPristine();
      },
      error: () => notify('Echec de la sauvegarde', 'error', 3000),
    });

  }

  onCancel() {

    if (!this.createMode) {
      this.formGroup.reset(this.transporteur);
      this.readOnlyMode = true;
    } else {
      this.router.navigate([`/tiers/transporteurs`]);
    }
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  fileManagerClick() {
    this.fileManagerComponent.visible = true;
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/${this.transporteur.id}/${this.transporteur.typeTiers}`]);
  }

}
