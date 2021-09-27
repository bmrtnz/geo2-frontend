import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { LocalizePipe } from 'app/shared/pipes';
import { ClientsService } from 'app/shared/services';
import { OrdreLignesService } from 'app/shared/services/api/ordres-lignes.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import DataSource from 'devextreme/data/data_source';
import { dxDataGridRowObject } from 'devextreme/ui/data_grid';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grid-clients-dep-encours-detail',
  templateUrl: './grid-clients-dep-encours-detail.component.html',
  styleUrls: ['./grid-clients-dep-encours-detail.component.scss']
})
export class GridClientsDepEncoursDetailComponent implements OnInit {
  @Input() masterRow: dxDataGridRowObject;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;

  public title: string;
  private dataFilter = /* tslint:disable-next-line max-line-length */
    /^raisonSocial|refusCoface|agrement|enCoursTemporaire|enCoursBlueWhale|autorise|depassement|enCoursActuel|enCoursNonEchu|enCours1a30|enCours31a60|enCours90Plus|alerteCoface|enCoursDouteux|ville|enCoursDateLimite|valide$/;

  constructor(
    private localizePipe: LocalizePipe,
    private datePipe: DatePipe,
    private clientsService: ClientsService,
    public gridConfiguratorService: GridConfiguratorService
  ) {
    this.detailedFields = this.clientsService.model.getDetailedFields(
      3,
      this.dataFilter,
      { forceFilter: true }
    );
    this.title = this.localizePipe.transform('grid-depassement-encours-client-title');
  }

  ngOnInit() {
    this.dataSource = this.clientsService.getDataSource(1, this.dataFilter);
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
