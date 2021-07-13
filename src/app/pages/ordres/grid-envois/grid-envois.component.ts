import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import Envois from 'app/shared/models/envois.model';
import { EnvoisService } from 'app/shared/services/api/envois.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import {AuthService} from 'app/shared/services/auth.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DxDataGridComponent } from 'devextreme-angular';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import Ordre from 'app/shared/models/ordre.model';
import {ViewDocument} from 'app/shared/components/view-document-popup/view-document-popup.component';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-grid-envois',
  templateUrl: './grid-envois.component.html',
  styleUrls: ['./grid-envois.component.scss']
})
export class GridEnvoisComponent implements OnInit, OnChanges {

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
    this.dataSource = envoisService.getDataSource();
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

  ngOnChanges() {
    this.enableFilters();
  }

  enableFilters() {
    if (this.ordre) {
       this.dataSource.filter([
        ['ordre.id', '=', this.ordre.id],
      ]);
      this.reload();
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

    const filename = envois.document.filename;
    const unsafeUrl = `/file-manager/document/${filename}`;

    this.currentDocument = {
      title: `${envois.flux.description.ucFirst()} ${envois.typeTiers.description}`,
      url: unsafeUrl
    };
    this.documentVisible = true;

    this.ordreSelected.emit(event.data.ordre);
  }

}
