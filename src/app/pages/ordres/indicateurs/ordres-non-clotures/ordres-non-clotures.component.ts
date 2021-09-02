import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { AuthService, LocalizationService, TransporteursService } from 'app/shared/services';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { DxoGridComponent } from 'devextreme-angular/ui/nested';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'ordres-non-clotures',
  templateUrl: './ordres-non-clotures.component.html',
  styleUrls: ['./ordres-non-clotures.component.scss']
})
export class OrdresNonCloturesComponent implements OnInit {

  readonly INDICATOR_NAME = 'OrdresNonClotures';
  options: {};
  secteurs: DataSource;
  indicator: string;
  filter: any;
  columnChooser = environment.columnChooser;
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  rowSelected: boolean;
  
  @ViewChild('gridORDRESNONCLOTURES', { static: false }) gridSUPERVISIONComponent: DxoGridComponent;
  @ViewChild('secteurValue', { static: false }) secteurSB: DxSelectBoxComponent;
  
  public dataSource: DataSource;

  /* tslint:disable-next-line max-line-length */
  private gridFilter: RegExp = /^(?:numero|referenceClient|dateDepartPrevue|dateLivraisonPrevue|codeClient|codeAlphaEntrepot|type|client\.raisonSocial|secteurCommercial\.id|entrepot\.raisonSocial)$/;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    public transporteursService: TransporteursService,
    public gridService: GridsConfigsService,
    public gridConfiguratorService: GridConfiguratorService,
    public secteursService: SecteursService,
    public currentCompanyService: CurrentCompanyService,
    public ordresService: OrdresService,
    public authService: AuthService,
    public localizeService: LocalizationService,
    private ordresIndicatorsService: OrdresIndicatorsService,
  ) {
    this.secteurs = secteursService.getDataSource();
    this.secteurs.filter([
      ['valide', '=', true],
      'and',
      ['societes', 'contains', this.currentCompanyService.getCompany().id]
    ])
    this.detailedFields = this.ordresService.model
    .getDetailedFields(3, this.gridFilter, {forceFilter: true});
    this.dataSource = ordresService.getDataSource(null, 2, this.gridFilter);
   }

  ngOnInit() {
    this.enableFilters();
    
  }

  ngAfterViewInit() {

    if (this.authService.currentUser.limitationSecteur) {
      this.secteurSB.value = this.authService.currentUser.secteurCommercial.id;
    }

  }

  enableFilters() {

    const filters = this.ordresIndicatorsService.getIndicatorByName(this.INDICATOR_NAME).filter;

    this.dataSource.filter(filters);

  }

  updateFilters() {

    // Retrieves the initial filter while removing date criteria
    const filters = this.ordresIndicatorsService.getIndicatorByName(this.INDICATOR_NAME).filter;
    // filters.splice(-4,4);

    if (this.secteurSB.value)    filters.push('and', ['secteurCommercial.id', '=', this.secteurSB.value.id]);

    // filters.push(
    //   'and',
    //   ['dateLivraisonPrevue', '>=', this.ordresIndicatorsService.getFormatedDate(this.dateStartSB.value)],
    //   'and',
    //   ['dateLivraisonPrevue', '<=', this.ordresIndicatorsService.getFormatedDate(this.dateEndSB.value)],
    // )
    
    this.dataSource.filter(filters);
    this.dataSource.reload();

  }

  onRowClick(event) {
    this.rowSelected = true;
  }

  onRowDblClick(e) {
    window.sessionStorage.setItem('orderNumber', JSON.stringify(e));
    this.router.navigate([`/ordres/details`]);
  }

}
