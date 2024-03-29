import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import { ViewDocument } from "app/shared/components/view-document-popup/view-document-popup.component";
import Envois from "app/shared/models/envois.model";
import Ordre from "app/shared/models/ordre.model";
import { EnvoisService } from "app/shared/services/api/envois.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig, GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "../grids.service";
import { AuthService } from "app/shared/services";

@Component({
  selector: "app-grid-envois",
  templateUrl: "./grid-envois.component.html",
  styleUrls: ["./grid-envois.component.scss"],
})
export class GridEnvoisComponent implements OnInit, AfterViewInit {
  @Output() public ordreSelected = new EventEmitter<Envois>();
  @Input() public filter: [];
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  private staticFields = ["flux.description"];

  public documentVisible = false;
  public currentDocument: ViewDocument;

  constructor(
    private envoisService: EnvoisService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public gridsService: GridsService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.Envois
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }
  ngOnInit(): void {
    this.enableFilters();
  }

  ngAfterViewInit() {
    this.gridsService.register("Envois", this.dataGrid, this.gridsService.orderIdentifier(this.ordre));
  }

  async enableFilters() {
    if (this?.ordre?.id) {
      const fields = this.columns.pipe(
        map((columns) => columns.map((column) => column.dataField))
      );
      this.dataSource = this.envoisService.getDataSource_v2([
        ...(await fields.toPromise()),
        ...this.staticFields,
      ]);
      this.dataSource.filter([
        ["ordre.id", "=", this.ordre.id],
        "and",
        [
          ["traite", "=", "N"],
          "or",
          ["traite", "=", "O"],
          "or",
          ["traite", "isnull", "null"], // pour les envois historiques ;)
        ],
      ]);
      this.dataGrid.dataSource = this.dataSource;
    }
  }

  reload() {
    this.dataSource?.reload();
  }

  onRowDblClick(event) {
    const envoi: Envois = event.data;

    if (!envoi.document || (envoi.document && !envoi.document.isPresent)) {
      notify("Désolé, document non accessible", "error");
      return;
    }

    this.currentDocument = {
      title: `${envoi.flux.description.ucFirst()} ${envoi.typeTiers.description
        }`,
      document: envoi.document,
    };
    this.documentVisible = true;

    this.ordreSelected.emit(event.data.ordre);
  }

}
