import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import LitigeLigneTotaux from 'app/shared/models/litige-ligne-totaux.model';
import Litige from 'app/shared/models/litige.model';
import Ordre from 'app/shared/models/ordre.model';
import { LitigesLignesService } from 'app/shared/services/api/litiges-lignes.service';
import { LitigesService } from 'app/shared/services/api/litiges.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { DxNumberBoxComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { from } from 'rxjs';
import { mergeAll } from 'rxjs/operators';

@Component({
  selector: 'app-form-litiges',
  templateUrl: './form-litiges.component.html',
  styleUrls: ['./form-litiges.component.scss']
})
export class FormLitigesComponent implements OnInit {

  @Output() public ordreSelected = new EventEmitter<Litige>();
  @Input() public ordre: Ordre;

  formGroup = this.fb.group({
    id: [''],
    ordreAvoirFournisseurReference: [''],
    dateCreation: [''],
    avoirClient: [''],
    avoirClientTaux: [''],
    dateAvoirClient: [''],
    avoirFournisseurTaux: [''],
    avoirFournisseur: [''],
    dateAvoirFournisseur: [''],
    referenceClient: [''],
    clientCloture: [''],
    fournisseurCloture: [''],
    clientValideAdmin: [''],
    fournisseurValideAdmin: [''],
    commentairesInternes: [''],
    totalMontantRistourneTaux: [''],
    ordreAvoirClient: this.fb.group({
      id: [''],
    }),
    fraisAnnexes: [''],
    totalMontantRistourne: ['']
  });

  contentReadyEvent = new EventEmitter<any>();
  refreshGrid = new EventEmitter();

  litiges: DataSource;
  ordres: DataSource;
  noLitiges = null;
  devise = 'EUR';
  ddeAvoirFournisseur: any;
  totalMontantRistourne: any;
  columns: any;

  @ViewChild('resultat', { static: false }) resultat: DxNumberBoxComponent;

  constructor(
    private fb: FormBuilder,
    public litigesService: LitigesService,
    public ordresService: OrdresService,
    public currentCompanyService: CurrentCompanyService,
    public litigesLignesService: LitigesLignesService,
  ) {

  }

  ngOnInit() {

    this.ordres = this.ordresService.getDataSource_v2(['id']);
    this.ordres.filter([
      ['valide', '=', true],
      'and',
      ['societe.id', '=', this.currentCompanyService.getCompany().id],
    ]);
    this.columns = [
      'id',
      'ordreAvoirFournisseurReference',
      'dateCreation',
      'dateAvoirClient',
      'dateAvoirFournisseur',
      'referenceClient',
      'clientCloture',
      'fournisseurCloture',
      'clientValideAdmin',
      'fournisseurValideAdmin',
      'commentairesInternes',
      'ordreAvoirClient.id',
      'fraisAnnexes',
      'totalMontantRistourne'
    ];

  }

  showForm() {

    if (this.ordre?.id) {
      const ds = this.litigesService.getDataSource_v2(this.columns);
      ds.filter(['ordreOrigine.id', '=', this.ordre.id]);
      ds.load().then(
        res => {
          if (res.length) {
            this.noLitiges = false;
            this.formGroup.patchValue(res[0]);
            from(this.litigesLignesService.getTotaux(res[0].id))
            .pipe(mergeAll())
            .subscribe(result => {
              const totaux: LitigeLigneTotaux & {resultat?: number} = result.data.litigeLigneTotaux;
              totaux.resultat = totaux.avoirFournisseur - totaux.avoirClient - totaux.fraisAnnexes;
              this.devise = totaux.devise.id;
              this.resultat.value = totaux.resultat;
              if (totaux.totalMontantRistourne) this.totalMontantRistourne = true;
              this.formGroup.patchValue(totaux);
            });
          } else {
            this.noLitiges = true;
          }
        }
      );
    }

  }

  onSubmit() {}

  onToggling(toggled: boolean) {
    if (toggled) this.showForm();
  }

}
