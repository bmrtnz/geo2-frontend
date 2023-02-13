import { Component, Input, QueryList, ViewChild, ViewChildren } from "@angular/core";
import FraisLitige from "app/shared/models/ordre-frais-litige.model";
import Ordre from "app/shared/models/ordre.model";
import { AuthService, EntrepotsService, LieuxPassageAQuaiService, LocalizationService, TransporteursService } from "app/shared/services";
import { DevisesService } from "app/shared/services/api/devises.service";
import { OrdresFraisLitigeService } from "app/shared/services/api/ordres-frais-litige.service";
import { TransitairesService } from "app/shared/services/api/transitaires.service";
import { TypesFraisService } from "app/shared/services/api/types-frais.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig, GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-grid-frais-annexes-litige",
  templateUrl: "./grid-frais-annexes-litige.component.html",
  styleUrls: ["./grid-frais-annexes-litige.component.scss"]
})
export class GridFraisAnnexesLitigeComponent {

  @Input() public ordre: Ordre;
  @Input() public idLitige: string;


  public dataSource: DataSource;
  public fraisSource: DataSource;
  public deviseSource: DataSource;
  public codePlusSource: DataSource;
  public codePlusList: string[];
  public selectPhase: boolean;
  public codePlusTransporteurs: string[];
  public itemsWithSelectBox: string[];
  public descriptionOnlyDisplaySB: string[];
  public SelectBoxPopupWidth: number;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChildren(DxSelectBoxComponent) selectBoxes: QueryList<DxSelectBoxComponent>;

  constructor(
    private ordresFraisLitigeService: OrdresFraisLitigeService,
    public fraisService: TypesFraisService,
    public deviseService: DevisesService,
    public gridConfiguratorService: GridConfiguratorService,
    public codePlusService: TransporteursService,
    public transporteursService: TransporteursService,
    public transitairesService: TransitairesService,
    public lieuxPassageAQuaiService: LieuxPassageAQuaiService,
    public entrepotsService: EntrepotsService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public authService: AuthService
  ) {
    this.displayDescOnly = this.displayDescOnly.bind(this);
    this.displayCustom = this.displayCustom.bind(this);
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreFraisLitige,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );
    this.itemsWithSelectBox = [
      "transporteurCodePlus"
    ];
    this.selectPhase = false;
    this.updateCodePlusDataSource();
  }

  async enableFilters() {
    if (this.idLitige) {
      const fields = this.columns.pipe(map(columns => columns.map(column => {
        return column.dataField;
      })));
      this.dataSource = this.ordresFraisLitigeService.getDataSource_v2(
        await fields.toPromise(),
      );
      this.dataSource.filter(["litige.id", "=", this.idLitige]);
      this.datagrid.dataSource = this.dataSource;
    } else if (this.datagrid) this.datagrid.dataSource = null;
  }

  onInitNewRow(e) {
    e.litige = { id: this.idLitige };
    e.frais = { id: "DIVERS" };
    setTimeout(() => this.datagrid.instance.saveEditData(), 1);
  }

  onRowInserting({ data }: { data: Partial<FraisLitige> }) {
    // data.litige = { id: this.idLitige };
    // data.frais = { id: "DIVERS" };
  }

  onValueChanged(event, cell) {
    if (!event.event) return;
    let valueToSave;

    if (cell.setValue) {
      if (typeof event.value === "object" && cell.column.dataField === "transporteurCodePlus") {
        valueToSave = event.value.id;
      } else {
        valueToSave = event.value;
      }
      cell.setValue(valueToSave);
    }
  }

  displayIdBefore(data) {
    return data ? data.id + " - " + data.raisonSocial : null;
  }

  displayDescOnly(data) {
    return data ? this.capitalize(data.description) : null;
  }

  displayCustom(data) {
    if (this.selectPhase) {
      return this.displayIdBefore(data);
    } else {
      return data;
    }
  }

  capitalize(data) {
    return data ? data.charAt(0).toUpperCase() + data.slice(1).toLowerCase() : null;
  }

  updateCodePlusDataSource() {
    this.codePlusSource = this.transporteursService.getDataSource_v2(["id", "raisonSocial"]);
  }

  // onCellClick(e) {
  //   // No DS is displayed
  //   if (e.column.dataField === "transporteurCodePlus") {
  //     if (this.isCustomText(e.data)) {
  //       this.SelectBoxPopupWidth = 0;
  //       e.cellElement.classList.add("no-arrow");
  //     } else {
  //       this.SelectBoxPopupWidth = 400;
  //       e.cellElement.classList.remove("no-arrow");
  //       this.updateCodePlusDataSource(e.data);
  //     }
  //   }
  // }

  // isCustomText(data) {
  //   return ["DIVERS", "ANIM"].includes(data.frais?.id);
  // }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Higlight important columns
      if ([
        "deviseTaux",
        "montantTotal"
      ].includes(e.column.dataField)) {
        // Grey background
        e.cellElement.classList.add("grey-light");
      }
    }
  }

  onSaved() {
    this.selectPhase = false;
    this.datagrid.instance.repaint();
  }

}
