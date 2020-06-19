import {Component, Input, NgModule, OnChanges} from '@angular/core';
import {DxButtonModule, DxDataGridModule, DxPopupModule} from 'devextreme-angular';
import {SharedModule} from '../../shared.module';
import {Historique} from '../../models';

@Component({
  selector: 'app-historique-valide',
  templateUrl: './historique-valide.component.html',
  styleUrls: ['./historique-valide.component.scss']
})
export class HistoriqueValideComponent implements OnChanges {

  @Input() historique: Historique[];
  btnVisible = false;
  visible = false;

  constructor() { }

  ngOnChanges() {
    if (this.historique) {
      this.btnVisible = this.historique.length > 0;
    }
  }
}

@NgModule({
  declarations: [HistoriqueValideComponent],
  imports: [
    DxButtonModule,
    DxPopupModule,
    DxDataGridModule,
    SharedModule
  ],
  exports: [HistoriqueValideComponent]
})
export class HistoriqueValideModule { }
