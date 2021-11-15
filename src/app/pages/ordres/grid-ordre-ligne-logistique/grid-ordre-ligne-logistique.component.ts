import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import Ordre from 'app/shared/models/ordre.model';
import { OrdresLogistiquesService } from 'app/shared/services/api/ordres-logistiques.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import * as gridConfig from 'assets/configurations/grids.json';
import { GridColumn } from 'basic';

@Component({
  selector: 'app-grid-ordre-ligne-logistique',
  templateUrl: './grid-ordre-ligne-logistique.component.html',
  styleUrls: ['./grid-ordre-ligne-logistique.component.scss']
})
export class GridOrdreLigneLogistiqueComponent implements OnChanges {

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

  constructor(
    public ordresLogistiquesService: OrdresLogistiquesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService,
  ) {
    this.detailedFields = gridConfig['ordre-ligne-logistique'].columns;
    this.dataSource = ordresLogistiquesService.getDataSource_v2(this.detailedFields.map(property => property.dataField));
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
