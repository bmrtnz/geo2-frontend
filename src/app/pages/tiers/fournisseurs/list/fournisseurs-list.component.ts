import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain } from 'app/pages/nested/nested.component';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { LocalizationService } from 'app/shared/services';
import { ApiService } from 'app/shared/services/api.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FournisseursService } from '../../../../shared/services/api/fournisseurs.service';

@Component({
  selector: 'app-fournisseurs-list',
  templateUrl: './fournisseurs-list.component.html',
  styleUrls: ['./fournisseurs-list.component.scss']
})
export class FournisseursListComponent implements OnInit, NestedMain {

  fournisseurs: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  columnChooser = environment.columnChooser;
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;

  constructor(
    public fournisseursService: FournisseursService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    private router: Router,
  ) {
    this.apiService = this.fournisseursService;
  }

  ngOnInit() {
    this.fournisseurs = this.fournisseursService.getDataSource();
    this.detailedFields = this.fournisseursService.model.getDetailedFields()
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field =>
          !!(this.localizeService.localize('tiers-fournisseurs-' + field.path.replace('.description', ''))).length);
       }),
    );
  }

  onRowDblClick(event) {
    this.router.navigate([`/tiers/fournisseurs/${event.data.id}`]);
  }

  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }
  onCreate() {
    this.router.navigate([`/tiers/fournisseurs/create`]);
  }

}
