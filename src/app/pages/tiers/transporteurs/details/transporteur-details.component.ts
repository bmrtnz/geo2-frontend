import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TransporteursService } from '../../../../shared/services/transporteurs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Transporteur } from '../../../../shared/models';
import { FormBuilder } from '@angular/forms';
import { RegimesTvaService } from 'app/shared/services/regimes-tva.service';
import { DevisesService } from 'app/shared/services/devises.service';
import { MoyensPaiementService } from 'app/shared/services/moyens-paiement.service';
import { BasesPaiementService } from 'app/shared/services/bases-paiement.service';
import { PaysService } from 'app/shared/services/pays.service';
import DataSource from 'devextreme/data/data_source';
import { ClientsService } from 'app/shared/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-transporteur-details',
  templateUrl: './transporteur-details.component.html',
  styleUrls: ['./transporteur-details.component.scss']
})
export class TransporteurDetailsComponent implements OnInit, AfterViewInit {

  transporteurForm = this.fb.group({
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
    valide: [false]
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };

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
  readOnlyMode = true;
  createMode = false;

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
  ) {
    this.defaultVisible = false;
    this.checkCode = this.checkCode.bind(this);
  }
  ngAfterViewInit(): void {
    this.transporteurForm.reset(this.transporteur);
  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.createMode = this.route.snapshot.url[0].path === 'create';
      this.readOnlyMode = !this.createMode;
      if (!this.createMode) {
        this.transporteursService
          .getOne(params.id)
          .subscribe( res => {
            this.transporteur = res.data.transporteur;
            this.transporteurForm.patchValue(this.transporteur);
          });
      } else {
        this.transporteur = new Transporteur({});
      }
    });

    this.pays = this.paysService.getDataSource();
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.devises = this.devisesService.getDataSource();
    this.moyensPaiement = this.moyensPaiementService.getDataSource();
    this.basesPaiement = this.basesPaiementService.getDataSource();
    this.clientsRaisonSocial = this.clientsService.getDataSource();

  }

  checkCode(params) {
      const code = params.value.toUpperCase();
      const transporteursSource = this.transporteursService.getDataSource({ search: `id=="${ code }"` });
      return transporteursSource.load().then(res => !(res.length));
  }

  onSubmit() {

    if (!this.transporteurForm.pristine && this.transporteurForm.valid) {
      const transporteur = this.transporteursService.extractDirty(this.transporteurForm.controls);

      if (this.createMode) {
        transporteur.id = this.transporteurForm.get('id').value.toUpperCase();
          // Ici on fait rien pour le moment l'id est deja dans l'object lieupassageaquai
          // Avoir pour les valeur par defaut (qui sont not null dans la base)
      } else {
        transporteur.id = this.transporteur.id;
      }

      this.transporteursService
      .save({ transporteur })
        .subscribe({
          next: () => {
            notify('Sauvegardé', 'success', 3000);
            if (!this.createMode) {
              this.transporteur = { id: this.transporteur.id, ...this.transporteurForm.getRawValue() };
              this.readOnlyMode = true;
            } else {
              this.router.navigate([`/tiers/transporteurs/${transporteur.id}`]);
            }
          },
          error: () => notify('Echec de la sauvegarde', 'error', 3000),
        });
      }
  }

  onCancel() {
    if (!this.createMode) {
      this.transporteurForm.reset(this.transporteur);
      this.readOnlyMode = true;
    } else {
      this.router.navigate([`/tiers/transporteurs`]);
    }
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/${ this.transporteur.id }/${ this.transporteur.typeTiers }`]);
  }

}
