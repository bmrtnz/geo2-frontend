import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { LocalizePipe } from 'app/shared/pipes';
import { ClientsService } from 'app/shared/services';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import DataSource from 'devextreme/data/data_source';
import { dxDataGridRowObject } from 'devextreme/ui/data_grid';
import { environment } from 'environments/environment';
import { GridColumn } from 'basic';
import * as gridConfig from 'assets/configurations/grids.json';

@Component({
  selector: 'app-grid-clients-dep-encours-detail',
  templateUrl: './grid-clients-dep-encours-detail.component.html',
  styleUrls: ['./grid-clients-dep-encours-detail.component.scss']
})
export class GridClientsDepEncoursDetailComponent implements OnInit {
  @Input() masterRow: dxDataGridRowObject;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];

  public title: string;

  constructor(
    private localizePipe: LocalizePipe,
    private datePipe: DatePipe,
    private clientsService: ClientsService,
    public gridConfiguratorService: GridConfiguratorService
  ) {
    this.detailedFields = gridConfig['depassement-encours-client'].columns as GridColumn[];
    this.title = this.localizePipe.transform('grid-depassement-encours-client-title');
  }

  ngOnInit() {
    this.dataSource = this.clientsService.getDataSource_v2(this.detailedFields.map(property => property.dataField));
    this.enableFilters();
  }

  enableFilters() {
    this.dataSource.filter([['pays.id', '=', this.masterRow.data.id]]);
  }

  onCellPrepared(event) {
    if (event.rowType !== 'data') return;
    if (event.column.dataField === 'raisonSocial') {
      const originalText = (event.cellElement as HTMLElement).innerText;
      if (event.data.enCoursDouteux > 0) {
        (event.cellElement as HTMLElement).innerText = `>>> ${originalText} ${event.data.ville}`;
        (event.cellElement as HTMLElement).classList.add('underline');
      }
      if (event.data.enCoursDateLimite)
        (event.cellElement as HTMLElement).innerText += ` -> ${this.datePipe.transform((new Date(event.data.enCoursDateLimite)))}`;
      if (!event.data.valide)
        (event.cellElement as HTMLElement).classList.add('strike');
    }
  }

}
