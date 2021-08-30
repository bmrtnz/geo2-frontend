import { Component, Input, ViewChild } from '@angular/core';
import type { Model } from 'app/shared/models/model';
import { ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { LocalizationService } from 'app/shared/services';
import { TracabiliteLignesService } from 'app/shared/services/api/tracabilite-lignes.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToggledGrid } from '../details/ordres-details.component';

@Component({
  selector: 'app-grid-detail-palettes',
  templateUrl: './grid-detail-palettes.component.html',
  styleUrls: ['./grid-detail-palettes.component.scss']
})
export class GridDetailPalettesComponent implements ToggledGrid {
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  /* tslint:disable-next-line max-line-length */
  gridFilter: RegExp = /^(?:arboCode|nombreColis|ordreLigne\.(?:nombrePalettesExpediees|numero|nombreColisExpedies|libelleDLV|fournisseur\.code|ordre\.(?:id|numero|client\.raisonSocial|referenceClient)|logistique\.(?:nombrePalettesAuSol|totalPalettesExpediees|dateDepartReelleFournisseur)|article\.(?:id|description|matierePremiere\.(?:variete\.description|espece\.description)|normalisation\.calibreMarquage\.description|emballage\.emballage\.description))|tracabiliteDetailPalette\.(?:SSCC|poidsNet|poidsBrut|paletteAuSol|typePalette\.description))$/;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;

  constructor(
    private tracabiliteLignesService: TracabiliteLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.detailedFields = this.tracabiliteLignesService.model
    .getDetailedFields(5, this.gridFilter, {forceFilter: true})
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field => 
          !!(this.localizeService.localize('ordreDetailPalettes-' + field.path.replaceAll('.', '-'))).length);
      }),
    );
  }

  enableFilters() {
    if (this.ordre) {
      this.dataSource = this.tracabiliteLignesService
      .getDataSource(4, this.gridFilter);
      this.dataSource.filter([['tracabiliteDetailPalette.ordre.id', '=', this.ordre.id]]);
    }
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : this.dataSource = null;
  }
}
