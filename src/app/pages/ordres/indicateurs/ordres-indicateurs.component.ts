import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { AuthService, TransporteursService } from '../../../shared/services';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { Observable } from 'rxjs';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-ordres-indicateurs',
  templateUrl: './ordres-indicateurs.component.html',
  styleUrls: ['./ordres-indicateurs.component.scss']
})
export class OrdresIndicateursComponent implements OnInit {

  transporteurs: DataSource;
  options: {};
  indicator: string;
  filter: ([string, string, boolean|string]|string)[];
  columnChooser = environment.columnChooser;
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  rowSelected: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public transporteursService: TransporteursService,
    public gridService: GridsConfigsService,
    public gridConfiguratorService: GridConfiguratorService,
    public authService: AuthService,
    private datePipe: DatePipe,
  ) {
    // this.apiService = transporteursService;
   }

  ngOnInit() {
    this.transporteurs = this.transporteursService.getDataSource();
    this.detailedFields = this.transporteursService.model.getDetailedFields();

    this.route.queryParams.subscribe(res => {
      this.options = res;
      this.indicator = res.filtre;
      const dateTomorrow = new Date();
      dateTomorrow.setDate(dateTomorrow.getDate() + 1);
      if (this.indicator === 'bonsafacturer') {
        this.filter = [
          ['bonAFacturer', '=', false],
          'and',
          ['client.usageInterne', '<>', true],
          'and',
          ['dateLivraisonPrevue', '>=', this.datePipe.transform(Date.now(), 'yyyy-MM-dd')],
          'and',
          ['dateLivraisonPrevue', '<', this.datePipe.transform(dateTomorrow.valueOf(), 'yyyy-MM-dd')],
        ];
        if (this.authService.currentUser.limitationSecteur) {
          this.filter.push('and');
          this.filter.push(['secteurCommercial.id', '=', this.authService.currentUser.secteurCommercial.id]);
        }
      }
      if (this.indicator === 'ordresnonclotures') {
        this.filter = [['livre', '=', false]];
        console.log('this.filter = ["livre", "=", false];')
      }
      if (this.indicator === 'supervisionlivraison') {
        this.filter = [['codeClient', '<>', 'PREORDRE%']];
        if (this.authService.currentUser.limitationSecteur) {
          this.filter.push('and');
          this.filter.push(['secteurCommercial.id', '=', this.authService.currentUser.secteurCommercial.id]);
        }
      }
    });
  }

  onRowClick(event) {
    this.rowSelected = true;
  }

  onRowDblClick(e) {
    window.localStorage.setItem('orderNumber', JSON.stringify(e));
    this.router.navigate([`/ordres/details`]);
  }

  onConfirm() {
  }

  onClose() {
  }

}
