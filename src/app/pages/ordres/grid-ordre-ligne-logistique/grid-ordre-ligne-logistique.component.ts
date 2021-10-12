import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { OrdresLogistiquesService } from 'app/shared/services/api/ordres-logistiques.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-grid-ordre-ligne-logistique',
  templateUrl: './grid-ordre-ligne-logistique.component.html',
  styleUrls: ['./grid-ordre-ligne-logistique.component.scss']
})
export class GridOrdreLigneLogistiqueComponent implements OnChanges {

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

  constructor(
    private ordresLogistiquesService: OrdresLogistiquesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService,
  ) {
    this.dataSource = ordresLogistiquesService.getDataSource();
    this.detailedFields = this.ordresLogistiquesService.model.getDetailedFields(2)
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field => 
          !!(this.localizeService.localize('ordreLigneLogistique-' + field.path.replaceAll('.', '-'))).length);
      }),
    );

    // .pipe(
    //   map(fields => {
    //     return fields.filter( field => {
    //       console.log('ordreLigneLogistique-' + field.path.replaceAll('.', '-'))
    //     })
    //   }),
    // );
  }

  ngOnChanges(changes: SimpleChanges) {
    this.enableFilters();
  }

  enableFilters() {
    if (this?.ordre?.id) {
      this.dataSource.filter([
        ['ordre.id', '=', this.ordre.id],
      ]);
      this.datagrid.dataSource = this.dataSource;
    } else if (this.datagrid)
      this.datagrid.dataSource = null;
  }

  applySentGridRowStyle(e) {
    if (e.rowType === 'data') {
      if (e.data.expedieStation) {
        e.rowElement.classList.add('sent-highlight-datagrid-row');
      }
    }
  }

}
