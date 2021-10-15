import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { Statut} from 'app/shared/models/ordre.model';
import { AuthService } from 'app/shared/services';
import { MruOrdresService } from 'app/shared/services/api/mru-ordres.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { historique } from 'assets/configurations/grids.json';
import { GridColumn } from 'basic';
import { Observable } from 'rxjs';
import { TabContext } from '../root/root.component';

@Component({
  selector: 'app-grid-historique',
  templateUrl: './grid-historique.component.html',
  styleUrls: ['./grid-historique.component.scss']
})
export class GridHistoriqueComponent implements OnInit {

  @Input() public filter: [];
  @ViewChild(DxDataGridComponent, {static: true}) histoGrid: DxDataGridComponent;

  readonly INDICATOR_NAME = 'Historique';

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;

  /* tslint:disable-next-line max-line-length */
  private gridFilter: RegExp = /^(?:ordre\.(numero|referenceClient|dateDepartPrevue|codeChargement|dateLivraisonPrevue|codeClient|statut|codeAlphaEntrepot|dateModification|client\.raisonSocial|secteurCommercial\.id|entrepot\.raisonSocial))$/;
  public detailedFields: GridColumn[];

  constructor(
    private mruOrdresService: MruOrdresService,
    public currentCompanyService: CurrentCompanyService,
    private authService: AuthService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public tabContext: TabContext,
  ) {
    this.detailedFields = historique.columns as GridColumn[];
    this.dataSource = mruOrdresService.getDataSource_v2(this.detailedFields.map(property => property.dataField));
  }

  ngOnInit() {
    this.enableFilters();
    this.histoGrid.dataSource = this.dataSource;
  }

  enableFilters() {
    const filters = [
      ['nomUtilisateur', '=', this.authService.currentUser.nomUtilisateur],
      'and',
      ['socCode', '=', this.currentCompanyService.getCompany().id],
    ];
    this.dataSource.filter(filters);
  }

  reload() {
    this.dataSource.reload();
  }

  onCellPrepared(e) {
    // Best expression for order status display
    if (e.rowType === 'data' && e.column.dataField === 'ordre.statut') {
      if (Statut[e.value]) e.cellElement.innerText = Statut[e.value];
    }
  }

}
