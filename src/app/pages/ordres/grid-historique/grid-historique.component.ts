import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { MruOrdresService } from 'app/shared/services/api/mru-ordres.service';
import { AuthService } from 'app/shared/services/auth.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grid-historique',
  templateUrl: './grid-historique.component.html',
  styleUrls: ['./grid-historique.component.scss']
})
export class GridHistoriqueComponent implements OnInit {

  @Output() public ordreSelected = new EventEmitter<Ordre>();
  @Input() public filter: [];
  @ViewChild(DxDataGridComponent, {static :true}) dataGrid : DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;

  /* tslint:disable-next-line max-line-length */
  private gridFilter: RegExp = /^(?:ordre\.(numero|referenceClient|dateDepartPrevue|dateLivraisonPrevue|codeClient|codeAlphaEntrepot|dateModification|client\.raisonSocial|secteurCommercial\.id|entrepot\.raisonSocial))$/;

  constructor(
    private ordresService: MruOrdresService,
    public currentCompanyService: CurrentCompanyService,
    private authService: AuthService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
  ) {
    this.dataSource = ordresService.getDataSource(2, this.gridFilter);
    this.detailedFields = this.ordresService.model
    .getDetailedFields(3, this.gridFilter, {forceFilter: true});
  }

  ngOnInit() {
    this.enableFilters();
  }

  enableFilters() {
    const filters = [
      ['utilisateur.nomUtilisateur', '=', this.authService.currentUser.nomUtilisateur],
      'and',
      ['societe.id', '=', this.currentCompanyService.getCompany().id],
    ];
    this.dataSource.filter(filters);
  }

  reload() {
    this.dataSource.reload();
  }

}
