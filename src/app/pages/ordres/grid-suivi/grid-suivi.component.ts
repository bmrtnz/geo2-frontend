import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;

  constructor(
    private ordresService: OrdresService,
    public gridConfiguratorService: GridConfiguratorService,
  ) {
    this.dataSource = ordresService.getDataSource();
    this.dataSource.filter([
      ['valide', '=', true],
      'and',
      ['societe.id', '=', environment.societe.id],
    ]);
    this.detailedFields = this.ordresService.model.getDetailedFields();
  }

  ngOnInit() {
  }

}
