import { Component, Input, OnChanges } from '@angular/core';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { LocalizationService } from 'app/shared/services';
import { OrdresLogistiquesService } from 'app/shared/services/api/ordres-logistiques.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-grid-logistiques',
  templateUrl: './grid-logistiques.component.html',
  styleUrls: ['./grid-logistiques.component.scss']
})
export class GridLogistiquesComponent implements OnChanges {

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  @Input() public ordre: Ordre;

  constructor(
    private ordresLogistiquesService: OrdresLogistiquesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService,
  ) {
    this.dataSource = ordresLogistiquesService.getDataSource(10, null);
    this.detailedFields = this.ordresLogistiquesService.model.getDetailedFields(6)
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field => 
          !!(this.localizeService.localize('ordreLogistique-' + field.path.replaceAll('.', '-'))).length);
      }),
    );
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
