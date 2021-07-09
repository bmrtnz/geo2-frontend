import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import LitigeLigneTotaux from 'app/shared/models/litige-ligne-totaux.model';
import Litige from 'app/shared/models/litige.model';
import Ordre from 'app/shared/models/ordre.model';
import { LitigesLignesService } from 'app/shared/services/api/litiges-lignes.service';
import { LitigesService } from 'app/shared/services/api/litiges.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import DataSource from 'devextreme/data/data_source';
import { from } from 'rxjs';
import { mergeAll } from 'rxjs/operators';

@Component({
  selector: 'app-form-litiges',
  templateUrl: './form-litiges.component.html',
  styleUrls: ['./form-litiges.component.scss']
})
export class FormLitigesComponent implements OnChanges, OnInit {

  @Output() public ordreSelected = new EventEmitter<Litige>();
  @Input() public ordre: Ordre;
  
  formGroup = this.fb.group({
    id: [''],
    ordreAvoirFournisseurReference: [''],
    dateCreation: [''],
    dateAvoirClient: [''],
    dateAvoirFournisseur: [''],
    referenceClient: [''],
    clientCloture: [''],
    fournisseurCloture: [''],
    clientValideAdmin: [''],
    fournisseurValideAdmin: [''],
    commentairesInternes: [''],
    ordreAvoirClient: [''],
    fraisAnnexes: [''],
    avoirClient: [''],
    avoirFournisseur: [''],
    totalMontantRistourne: [''],
    ristourneTaux: [''],
    avoirClientTaux: [''],
    avoirFournisseurTaux: [''],
    devise: [''],
    resultat: ['']
    
  });

  contentReadyEvent = new EventEmitter<any>();
  refreshGrid = new EventEmitter();

  litiges: DataSource;
  ordres: DataSource;
  noLitiges: boolean;
  devise: string = 'EUR';
  ddeAvoirFournisseur: any;
  totalMontantRistourne: any;

  constructor(
    private fb: FormBuilder,
    public litigesService: LitigesService,
    public ordresService: OrdresService,
    public litigesLignesService: LitigesLignesService,

  ) {

  }

  ngOnInit() {

    this.ordres = this.ordresService.getDataSource();

  }

  ngOnChanges() {

    this.noLitiges = false;
    const ds = this.litigesService.getDataSource();
    if (this.ordre?.id) {
      ds.filter(['ordreOrigine.id', '=', this.ordre.id]);
      ds.load().then(
        res => {
          if (res.length) {
            this.formGroup.patchValue(res[0]);
            // console.log(this.litigesLignesService.getTotaux(res[0].id).then(res => console.log(res)))
            from(this.litigesLignesService.getTotaux(res[0].id))
            .pipe(mergeAll())
            .subscribe(res => {
              const totaux: LitigeLigneTotaux & {resultat?: number} = res.data.litigeLigneTotaux; 
              totaux.resultat = totaux.avoirFournisseur - totaux.avoirClient - totaux.fraisAnnexes;
              this.devise = totaux.devise.id;
              this.formGroup.patchValue(totaux);
            })
          } else {
            this.noLitiges = true;
          }
        }
      );
    }

  }

  onSubmit() {

  }

}
