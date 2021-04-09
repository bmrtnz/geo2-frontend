import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-bon-a-facturer',
  templateUrl: './bon-a-facturer.component.html',
  styleUrls: ['./bon-a-facturer.component.scss']
})
export class BonAFacturerComponent implements OnInit {

  readonly INDICATOR_NAME = 'Bons';

  @Output() public ordreSelected = new EventEmitter<Ordre>();

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<ModelFieldOptions<typeof Model>[]>;

  constructor(
    private ordresService: OrdresService,
    public gridConfiguratorService: GridConfiguratorService,
    private ordresIndicatorsService: OrdresIndicatorsService,
    private router: Router,
  ) {
    this.dataSource = this.ordresService.getDataSource();
    this.detailedFields = this.ordresService.model.getDetailedFields();
  }

  ngOnInit() {
    this.enableFilters();
  }

  enableFilters() {
    const filters = this.ordresIndicatorsService.getIndicatorByName(this.INDICATOR_NAME).filter;

    this.dataSource.filter(filters);
    this.dataSource.reload();
  }

  onRowDblClick({data: ordre}: {data: Ordre}) {
    this.router.navigate(['ordres', 'details'], {
      queryParams: {pushordres: ordre.id},
    });
  }

}
