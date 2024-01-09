import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import { AuthService, ClientsService, LocalizationService } from "app/shared/services";
import {
  DxPopupComponent,
  DxScrollViewComponent,
  DxDataGridComponent,
} from "devextreme-angular";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { from, Observable } from "rxjs";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { map } from "rxjs/operators";
import Ordre from "app/shared/models/ordre.model";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import notify from "devextreme/ui/notify";

@Component({
  selector: "app-selection-compte-palox-popup",
  templateUrl: "./selection-compte-palox-popup.component.html",
  styleUrls: ["./selection-compte-palox-popup.component.scss"],
})
export class SelectionComptePaloxPopupComponent implements OnChanges {
  @Input() ordre: Partial<Ordre>;
  @Output() selectedClient = new EventEmitter<any>();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false })
  dxScrollView: DxScrollViewComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public detailedFields: GridColumn[];
  public visible: boolean;
  public gridHasData: boolean;
  public title: string;
  private hintNotValid: string;
  public popupFullscreen: boolean;

  constructor(
    private clientsService: ClientsService,
    private currentCompanyService: CurrentCompanyService,
    public gridConfiguratorService: GridConfiguratorService,
    public authService: AuthService,
    public localizeService: LocalizationService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.ComptePalox
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.hintNotValid = this.localizeService.localize("hint-not-valid-client");
  }

  ngOnChanges() {
    this.setTitle();
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
    }
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      if (!e.data.valide) {
        e.rowElement.classList.add("not-valid");
        e.rowElement.title = this.hintNotValid;
      }
    }
  }

  onRowDblClick(e) {
    const client = {
      id: this.ordre.client.id,
      paloxRaisonSocial: { id: e.data.id },
    };
    this.clientsService
      .save_v2(["paloxRaisonSocial.id"], { client })
      .subscribe({
        next: () => this.quitPopup(e.data.id),
        error: ({ message }: Error) => {
          notify(
            `Échec de l'enregistrement du compte Palox : ${message}`,
            "error",
            7000
          );
        },
      });
  }

  setTitle() {
    if (this.ordre?.id)
      this.title = this.localizeService.localize("title-selection-cpte-palox");
  }

  async enableFilters() {
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );
    this.dataSource = this.clientsService.getDataSource_v2(
      await fields.toPromise()
    );
    this.dataSource.filter([
      ["secteur.id", "=", "PAL"],
      "and",
      ["societe.id", "=", this.currentCompanyService.getCompany().id],
    ]);
    this.datagrid.dataSource = this.dataSource;
  }

  onShowing(e) {
    e.component
      .content()
      .parentNode.classList.add("selection-compte-palox-popup");
  }

  onShown() {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.enableFilters();
  }

  onHidden() {
    this.datagrid.dataSource = null;
  }

  quitPopup(errorMessage?) {
    this.selectedClient.emit(errorMessage);
    this.popup.visible = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

}
