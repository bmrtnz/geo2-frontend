import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grid-suivi',
  templateUrl: './grid-suivi.component.html',
  styleUrls: ['./grid-suivi.component.scss']
})
export class GridSuiviComponent implements OnInit {

  @Output() public ordreSelected = new EventEmitter<Ordre>();
  @Input() public filter: [];

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;

  constructor(
    private ordresService: OrdresService,
    public gridConfiguratorService: GridConfiguratorService,
  ) {
    this.dataSource = ordresService.getDataSource();
    this.detailedFields = this.ordresService.model.getDetailedFields();
  }

  ngOnInit() {
    this.enableFilters();
  }

  enableFilters() {
    let filters = [
      ['valide', '=', true],
      'and',
      ['societe.id', '=', environment.societe.id],
      'and',
      ['facture', '=', false]
    ];
    if (this.filter) filters = [...filters, 'and', this.filter];
    this.dataSource.filter(filters);
    this.dataSource.reload();
  }

  reload() {
    this.dataSource.reload();
  }

}
