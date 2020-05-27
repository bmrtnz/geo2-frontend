import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-lieux-passage-a-quai-details',
  templateUrl: './lieux-passage-a-quai-details.component.html',
  styleUrls: ['./lieux-passage-a-quai-details.component.scss']
})
export class LieuxPassageAQuaiDetailsComponent implements OnInit {

  lieupassageaquaiForm = this.fb.group({
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
  readOnlyMode = true;

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
  }

  ngOnInit() {
    this.lieupassageaquaiService
      .getOne(this.route.snapshot.paramMap.get('id'))
      .subscribe( res => {
        this.lieupassageaquai = res.data.lieuPassageAQuai;
        this.lieupassageaquaiForm.patchValue(this.lieupassageaquai);
      });

    this.pays = this.paysService.getDataSource();
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.devises = this.devisesService.getDataSource();
    this.moyensPaiement = this.moyensPaiementService.getDataSource();
    this.basesPaiement = this.basesPaiementService.getDataSource();
  }

  onSubmit() {
    if (!this.lieupassageaquaiForm.pristine && this.lieupassageaquaiForm.valid) {
      const lieuPassageAQuai = this.lieupassageaquaiService
      .extractDirty(this.lieupassageaquaiForm.controls);
      this.lieupassageaquaiService
      .save({ lieuPassageAQuai: { ...lieuPassageAQuai, id: this.lieupassageaquai.id } })
      .subscribe({
        next: () => {
          notify('Sauvegardé', 'success', 3000);
          this.lieupassageaquai = { id: this.lieupassageaquai.id, ...this.lieupassageaquaiForm.getRawValue() };
          this.readOnlyMode = true;
        },
        error: () => notify('Echec de la sauvegarde', 'error', 3000),
      });
    }
  }

  onCancel() {
    this.lieupassageaquaiForm.reset(this.lieupassageaquai);
    this.readOnlyMode = true;
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    const search = `codeTiers=="${ this.lieupassageaquai.id }" and typeTiers==${ this.lieupassageaquai.typeTiers }`;
    this.router.navigate([`/tiers/contacts/${ this.lieupassageaquai.id }/${ this.lieupassageaquai.typeTiers }`], {
      queryParams: { search },
    });
  }

}
