import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class FormLitigesComponent implements OnInit {

  @Output() public ordreSelected = new EventEmitter<Litige>();
  @Input() public ordre: Ordre;
  
  formGroup = this.fb.group({
    id: [''],
    ordreAvoirClient: [''],
    ordreAvoirFournisseurReference: [''],

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

  ngOnInit() {

    this.litiges = this.litigesService.getDataSource();
    const ordre = this.ordresService.extractDirty(this.formGroup.controls);
    if (ordre.id) {
      this.litiges.filter(
        ['ordreOrigine', '=', ordre.id],
      )
    }
    
    this.litiges.load().then(res => {
      console.log(res)
    })
    
    // this.formGroup.patchValue(this.litiges);

  }

  onSubmit() {

  }

}
