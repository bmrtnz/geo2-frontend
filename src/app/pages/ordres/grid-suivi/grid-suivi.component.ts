import { Component, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import Ordre from 'app/shared/models/ordre.model';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { ordre } from 'assets/configurations/grids.json';
import { TabContext } from '../root/root.component';
import { GridColumn } from 'basic';

@Component({
  selector: 'app-grid-suivi',
  templateUrl: './grid-suivi.component.html',
  styleUrls: ['./grid-suivi.component.scss']
})
export class GridSuiviComponent implements OnInit, AfterViewInit {

  @Output() public ordreSelected = new EventEmitter<Ordre>();
  @Input() public filter: [];
  @ViewChild(DxDataGridComponent, {static: false}) suivigrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];

  constructor(
    public ordresService: OrdresService,
    public localizeService: LocalizationService,
    public currentCompanyService: CurrentCompanyService,
    public gridConfiguratorService: GridConfiguratorService,
    public tabContext: TabContext,
  ) {
    this.detailedFields = ordre.columns as GridColumn[];
    this.dataSource = ordresService.getDataSource_v2(this.detailedFields.map(property => property.dataField));
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.enableFilters();
    this.suivigrid.dataSource = this.dataSource;
  }

  enableFilters() {
    let filters = [
      ['valide', '=', true],
      'and',
      ['societe.id', '=', this.currentCompanyService.getCompany().id],
      'and',
      ['facture', '=', false]
    ];

    if (this.filter) filters = this.filter;

    this.dataSource.filter(filters);
   }

  reload() {
    this.dataSource.reload();
  }

}
