import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { DxDataGridComponent } from 'devextreme-angular';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import Ordre from 'app/shared/models/ordre.model';
import { LitigesLignesService } from 'app/shared/services/api/litiges-lignes.service';
import LitigeLigne from 'app/shared/models/litige-ligne.model';
import { ToggledGrid } from '../form/form.component';
import * as gridConfig from 'assets/configurations/grids.json';
import { GridColumn } from 'basic';

@Component({
  selector: 'app-grid-litiges-lignes',
  templateUrl: './grid-litiges-lignes.component.html',
  styleUrls: ['./grid-litiges-lignes.component.scss']
})
export class GridLitigesLignesComponent implements OnInit, ToggledGrid {

  @Output() public ordreSelected = new EventEmitter<LitigeLigne>();
  @Input() public filter: [];
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, {static: true}) dataGrid: DxDataGridComponent;

  public dataSource: DataSource;
  public detailedFields: GridColumn[];
  public columnChooser = environment.columnChooser;

  constructor(
    private litigesLignesService: LitigesLignesService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
  ) {
    this.detailedFields = gridConfig['litige-ligne'].columns;
  }

  ngOnInit() {
    // this.enableFilters();
  }

  sortGrid() {
    // this.dataGrid.instance.columnOption("dateModification", {​​​​​​​​ sortOrder: "desc"}​​​​​​​​);
  }

  enableFilters() {
    if (this.ordre?.id) {
      this.dataSource = this.litigesLignesService.getDataSource_v2(this.detailedFields.map(property => property.dataField));
      this.dataSource.filter([
        ['ordreLigne.ordre.id', '=', this.ordre.id],
      ]);
    }
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : this.dataSource = null;
  }

  reload() {
    this.dataSource.reload();
  }

}
