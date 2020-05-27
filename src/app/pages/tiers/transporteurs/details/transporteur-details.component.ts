import { Component, OnInit } from '@angular/core';
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
export class TransporteurDetailsComponent implements OnInit {

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
  regimesTva: DataSource;
  bureauxAchat: DataSource;
  typesTransporteur: DataSource;
  clients: DataSource;
  defaultVisible: boolean;
  readOnlyMode = true;

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
  }

  ngOnInit() {

    this.transporteursService
    .getOne(this.route.snapshot.paramMap.get('id'))
    .subscribe( res => {
      this.transporteur = res.data.transporteur;
      this.transporteurForm.patchValue(this.transporteur);
    });

    this.pays = this.paysService.getDataSource();
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.devises = this.devisesService.getDataSource();
    this.moyensPaiement = this.moyensPaiementService.getDataSource();
    this.basesPaiement = this.basesPaiementService.getDataSource();
    this.clients = this.clientsService.getDataSource();

  }

  onSubmit() {
    if (!this.transporteurForm.pristine && this.transporteurForm.valid) {
      const transporteur = this.transporteursService
      .extractDirty(this.transporteurForm.controls);
      this.transporteursService
      .save({ transporteur: { ...transporteur, id: this.transporteur.id }})
      .subscribe({
        next: () => {
          notify('Sauvegardé', 'success', 3000);
          this.transporteur = { id: this.transporteur.id, ...this.transporteurForm.getRawValue() };
          this.readOnlyMode = true;
        },
        error: () => notify('Echec de la sauvegarde', 'error', 3000),
      });
    }
  }

  onCancel() {
    this.transporteurForm.reset(this.transporteur);
    this.readOnlyMode = true;
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    const search = `codeTiers=="${ this.transporteur.id }" and typeTiers==${ this.transporteur.typeTiers }`;
    this.router.navigate([`/tiers/contacts/${ this.transporteur.id }/${ this.transporteur.typeTiers }`], {
      queryParams: { search },
    });
  }

}
