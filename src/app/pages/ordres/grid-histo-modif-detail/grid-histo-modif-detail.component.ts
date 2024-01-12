import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { LocalizationService } from "app/shared/services/localization.service";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { GridColumn } from "basic";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  GridConfiguratorService,
  Grid,
  GridConfig,
} from "app/shared/services/grid-configurator.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { HistoriqueModificationsDetailService } from "app/shared/services/api/historique-modifs-detail.service";
import Ordre from "app/shared/models/ordre.model";
import { AuthService } from "app/shared/services";

@Component({
  selector: "app-grid-histo-modif-detail",
  templateUrl: "./grid-histo-modif-detail.component.html",
  styleUrls: ["./grid-histo-modif-detail.component.scss"],
})
export class GridHistoModifDetailComponent implements OnChanges {
  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  @Input() public ligneLogistiqueId: string;
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

  constructor(
    public historiqueModificationsDetailService: HistoriqueModificationsDetailService,
    public gridConfiguratorService: GridConfiguratorService,
    public dateManagementService: DateManagementService,
    public authService: AuthService,
    public localizeService: LocalizationService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.HistoriqueModifDetail
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  ngOnChanges(changes: SimpleChanges) {
    this.enableFilters();
  }

  async enableFilters() {
    if (this.ligneLogistiqueId) {
      const fields = this.columns.pipe(
        map((columns) => columns.map((column) => column.dataField))
      );
      this.dataSource =
        this.historiqueModificationsDetailService.getDataSource_v2(
          await fields.toPromise()
        );
      this.dataSource.filter([
        ["logistique.id", "=", this.ligneLogistiqueId],
        "and",
        ["ordre.id", "=", this.ordre.id],
      ]);
      this.datagrid.dataSource = this.dataSource;
    } else if (this.datagrid) this.datagrid.dataSource = null;
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      if (
        [
          "nombrePalettesExpedieesApres",
          "nombreColisExpediesApres",
          "poidsBrutExpedieApres",
          "poidsNetExpedieApres",
        ].includes(e.column.dataField)
      ) {
        // Bold text
        e.cellElement.classList.add("bold-grey-light");
      }
    }
  }

  public refresh() {
    this.datagrid.instance.refresh();
  }
}
