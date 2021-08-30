import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ViewDocument } from 'app/shared/components/view-document-popup/view-document-popup.component';
import Envois from 'app/shared/models/envois.model';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { EnvoisService } from 'app/shared/services/api/envois.service';
import { AuthService } from 'app/shared/services/auth.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToggledGrid } from '../details/ordres-details.component';

@Component({
  selector: 'app-grid-envois',
  templateUrl: './grid-envois.component.html',
  styleUrls: ['./grid-envois.component.scss']
})
export class GridEnvoisComponent implements OnInit, ToggledGrid {

  @Output() public ordreSelected = new EventEmitter<Envois>();
  @Input() public filter: [];
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, {static :true}) dataGrid : DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;

  public documentVisible = false;
  public currentDocument: ViewDocument;

  constructor(
    private envoisService: EnvoisService,
    public currentCompanyService: CurrentCompanyService,
    private authService: AuthService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
  ) {
    this.detailedFields = this.envoisService.model.getDetailedFields(2)
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field =>
          !!(this.localizeService.localize('ordreEnvois-' + field.path.replaceAll('.', '-'))).length);
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

  ngOnInit() {
    // this.enableFilters();
  }

  sortGrid() {
    // this.dataGrid.instance.columnOption("dateModification", {​​​​​​​​ sortOrder: "desc"}​​​​​​​​);
  }

  enableFilters() {
    if (this.ordre) {
      this.dataSource = this.envoisService.getDataSource();
      this.dataSource.filter([
        ['ordre.id', '=', this.ordre.id],
      ]);
    }
  }

  reload() {
    this.dataSource.reload();
  }

  onRowDblClick(event) {
    const envois: Envois = event.data;

    if (envois.document && !envois.document.isPresent) {
      notify('Document non trouvé', 'error');
      return;
    }

    this.currentDocument = {
      title: `${envois.flux.description.ucFirst()} ${envois.typeTiers.description}`,
      document: envois.document
    };
    this.documentVisible = true;

    this.ordreSelected.emit(event.data.ordre);
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : this.dataSource = null;
  }
}
