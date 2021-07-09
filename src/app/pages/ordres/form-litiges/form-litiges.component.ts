import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import Litige from 'app/shared/models/litige.model';
import Ordre from 'app/shared/models/ordre.model';
import { LitigesService } from 'app/shared/services/api/litiges.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-form-litiges',
  templateUrl: './form-litiges.component.html',
  styleUrls: ['./form-litiges.component.scss']
})
export class FormLitigesComponent implements OnChanges {

  @Output() public ordreSelected = new EventEmitter<Litige>();
  @Input() public ordre: Ordre;
  
  formGroup = this.fb.group({
    id: [''],
    ordreAvoirClient: [''],
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

  });

  contentReadyEvent = new EventEmitter<any>();
  refreshGrid = new EventEmitter();

  litiges: DataSource;

  constructor(
    private fb: FormBuilder,
    public litigesService: LitigesService,
    public ordresService: OrdresService
  ) {

  }

  ngOnChanges() {

    const ds = this.litigesService.getDataSource();
    if (this.ordre?.id) {
      ds.filter(['ordreOrigine.id', '=', this.ordre.id]);
      ds.load().then(res => this.formGroup.patchValue(res[0])); // Array [{​​​​​​​​​…}​​​​​​​​​]
    }

    // this.formGroup.patchValue(res)

  }

  onSubmit() {

  }

}
