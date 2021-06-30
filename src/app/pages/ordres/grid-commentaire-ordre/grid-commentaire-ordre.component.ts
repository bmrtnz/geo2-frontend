import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import type { Model } from 'app/shared/models/model';
import { ModelFieldOptions } from 'app/shared/models/model';
import OrdreSaveLog from 'app/shared/models/ordre-save-log.model';
import Ordre from 'app/shared/models/ordre.model';
import { CommentairesOrdresService } from 'app/shared/services/api/commentaires-ordres.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grid-commentaire-ordre',
  templateUrl: './grid-commentaire-ordre.component.html',
  styleUrls: ['./grid-commentaire-ordre.component.scss']
})
export class GridCommentaireOrdreComponent implements OnChanges {
  @Output() public ordreSelected = new EventEmitter<OrdreSaveLog>();
  @Input() public filter: [];
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;

  constructor(
    private commentairesOrdresService: CommentairesOrdresService,
    public gridConfiguratorService: GridConfiguratorService
  ) {
    this.dataSource = this.commentairesOrdresService.getDataSource();
    this.detailedFields = this.commentairesOrdresService.model
    .getDetailedFields(1, /^(?:commentaires|userModification|dateModification)$/i, {forceFilter: true});
  }

  ngOnChanges() {
    this.enableFilters();
  }

  enableFilters() {
    if (this.ordre) {
      this.dataSource.filter([['ordre.id', '=', this.ordre.id]]);
      this.dataSource.reload();
    }
  }
}
