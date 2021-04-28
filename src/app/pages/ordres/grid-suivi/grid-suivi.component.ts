import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-grid-suivi',
  templateUrl: './grid-suivi.component.html',
  styleUrls: ['./grid-suivi.component.scss']
})
export class GridSuiviComponent implements OnInit {

  @Output() public ordreSelected = new EventEmitter<Ordre>();
  @Input() public filter: [];
  @ViewChild(DxDataGridComponent, {static: false}) datagrid:DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;

  constructor(
    private ordresService: OrdresService,
    public localizeService: LocalizationService,
    public currentCompanyService: CurrentCompanyService,
    public gridConfiguratorService: GridConfiguratorService,
  ) {
    this.dataSource = ordresService.getDataSource();
    this.detailedFields = this.ordresService.model.getDetailedFields()
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field => 
          !!(this.localizeService.localize('rechOrdres-' + field.path.replaceAll('.', '-').replace('-description', ''))).length);
      }),
    );
  }

  ngOnInit() {
    this.enableFilters();
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
    this.dataSource.reload();
  }

  reload() {
    this.dataSource.reload();
  }

}
