import { Component, Input, OnInit } from '@angular/core';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { OrdreLignesService } from 'app/shared/services/api/ordres-lignes.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import DataSource from 'devextreme/data/data_source';
import { dxDataGridRowObject } from 'devextreme/ui/data_grid';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { isThisTypeNode } from 'typescript';

@Component({
  selector: 'app-grid-detail-planning-departs',
  templateUrl: './grid-detail-planning-departs.component.html',
  styleUrls: ['./grid-detail-planning-departs.component.scss'],
})
export class GridDetailPlanningDepartsComponent implements OnInit {
  @Input() masterRow: dxDataGridRowObject;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;

  private dataFilter = /* tslint:disable-next-line max-line-length */
    /^nombreColisCommandes|nombreColisExpedies|ordre\.(?:transporteur\.raisonSocial|assistante\.nomUtilisateur|commercial\.nomUtilisateur)|logistique\.(?:fournisseur\.code|dateDepartPrevueFournisseur|dateDepartReelleFournisseur|fournisseurReferenceDOC|expedieStation|totalPalettesExpediees|nombrePalettesAuSol|nombrePalettes100x120|nombrePalettes80x120|nombrePalettes60X80)$/;

  constructor(
    private ordreLignesService: OrdreLignesService,
    public gridConfiguratorService: GridConfiguratorService
  ) {
    this.detailedFields = this.ordreLignesService.model.getDetailedFields(
      3,
      this.dataFilter,
      { forceFilter: true }
    );
  }

  ngOnInit() {
    this.dataSource = this.ordreLignesService.getDataSource(3, this.dataFilter);
    this.enableFilters();
  }

  enableFilters() {
    this.dataSource.filter([['ordre.id', '=', this.masterRow.data.id]]);
  }
}
