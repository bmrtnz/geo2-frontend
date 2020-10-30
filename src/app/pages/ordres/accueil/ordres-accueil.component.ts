import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FakeOrdresService, Indicator } from 'app/shared/services/ordres-fake.service';
import { DxTagBoxComponent } from 'devextreme-angular';

@Component({
  selector: 'app-ordres-accueil',
  templateUrl: './ordres-accueil.component.html',
  styleUrls: ['./ordres-accueil.component.scss'],
  providers: [FakeOrdresService]
})
export class OrdresAccueilComponent implements OnInit {

  indicators: Indicator[];
  allIndicators: Indicator[];
  @ViewChild(DxTagBoxComponent, { static: false }) tagBox: DxTagBoxComponent;

  constructor(
    fakeOrdresService: FakeOrdresService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.allIndicators = fakeOrdresService.getIndicators();
    this.indicators = this.allIndicators.slice(0, 4);
  }

  ngOnInit() {
  }

  displayExpr(data) {
    return data ? data.parameter + ' ' + data.subParameter : null;
  }

  onFieldValueChange(data) {
    this.indicators = [];
    data.forEach(index => {
      this.indicators.push(this.allIndicators[index]);
    });
  }

  openTagBox() {
    this.tagBox.instance.open();
   }
}
