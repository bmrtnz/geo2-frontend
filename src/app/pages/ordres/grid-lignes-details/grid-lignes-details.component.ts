import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { OrdreLignesService } from 'app/shared/services/api/ordres-lignes.service';
import { Observable } from 'rxjs';
import Ordre from 'app/shared/models/ordre.model';
import { map } from 'rxjs/operators';
import { LocalizationService } from 'app/shared/services/localization.service';

@Component({
  selector: 'app-grid-lignes-details',
  templateUrl: './grid-lignes-details.component.html',
  styleUrls: ['./grid-lignes-details.component.scss']
})
export class GridLignesDetailsComponent implements OnChanges {

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  @Input() public ordre: Ordre;

  constructor(
    private ordreLignesService: OrdreLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.dataSource = ordreLignesService.getDataSource();
    this.detailedFields = this.ordreLignesService.model.getDetailedFields()
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field => 
          !!(this.localizeService.localize('ordreLignes-' + field.path.replaceAll('.', '-'))).length);
      }),
    );

    // .pipe(
    //   map(fields => {
    //     return fields.filter( field => {
    //       console.log('ordreLignes-' + field.path.replaceAll('.', '-'))
    //     })
    //   }),
    // );


  }

  ngOnChanges() {
    this.enableFilters();
  }

  enableFilters() {
    if (this.ordre) {
      this.dataSource.filter([
        ['ordre.id', '=', this.ordre.id],
      ]);
      this.dataSource.reload();
    }
  }

}
