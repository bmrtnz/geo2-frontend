import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, NgForm } from "@angular/forms";
import { GridsService } from "app/pages/ordres/grids.service";
import {
  AuthService,
  LocalizationService,
  TransporteursService,
} from "app/shared/services";
import { PlanningTransporteursService } from "app/shared/services/api/planning-transporteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ModificationArticleEdiPopupComponent } from "../modification-article-edi-popup/modification-article-edi-popup.component";

enum FormInput {
  valide = "valide",
  clientCode = "transporteur",
  search = "dateDepartPrevueFournisseur",
}

type Inputs<T = any> = { [key in keyof typeof FormInput]: T };

@Component({
  selector: 'app-grid-articles-edi-colibri',
  templateUrl: './grid-articles-edi-colibri.component.html',
  styleUrls: ['./grid-articles-edi-colibri.component.scss']
})
export class GridArticlesEdiColibriComponent implements OnInit {
  private gridConfig: Promise<GridConfig>;
  public validRequiredEntity: {};

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild(ModificationArticleEdiPopupComponent) private modifPopup: ModificationArticleEdiPopupComponent;
  @ViewChild("filterForm") filterForm: NgForm;

  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public ordresDataSource: DataSource;
  public transporteursDataSource: DataSource;
  public formGroup = new UntypedFormGroup({
    valide: new UntypedFormControl(),
    clientCode: new UntypedFormControl(),
    search: new UntypedFormControl()
  } as Inputs<UntypedFormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public planningTransporteursService: PlanningTransporteursService,
    public transporteursService: TransporteursService,
    public authService: AuthService,
    public gridsService: GridsService,
    public localizeService: LocalizationService,
    public dateManagementService: DateManagementService,
    private currentCompanyService: CurrentCompanyService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchConfig(
      Grid.PlanningTransporteurs
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.transporteursDataSource = this.transporteursService.getDataSource_v2([
      "id",
      "raisonSocial",
      "valide",
    ]);
    this.transporteursDataSource.filter(["valide", "=", true]);
  }

  async ngOnInit() {
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );

    this.ordresDataSource = this.planningTransporteursService.getDataSource_v2(
      await fields.toPromise()
    );

    // Only way found to validate and show Warning icon
    this.formGroup.get("clientCode").setValue("");
    this.formGroup.get("clientCode").reset();
  }

  enableFilters() {
    if (!this.formGroup.get("clientCode").value) {
      notify(this.localizeService.localize("please-select-client"), "error", 1500);
    } else {
      const values: Inputs = {
        ...this.formGroup.value,
      };

      // Filtering vs company
      const societe = this.currentCompanyService.getCompany().id;
      if (societe === "BUK") this.ordresDataSource.filter(["ordre.type.id", "<>", "RGP"]);
      if (societe === "SA") this.ordresDataSource.filter(["ordre.type.id", "<>", "ORI"]);

      this.datagrid.dataSource = this.ordresDataSource;
    }
  }

  onRowDblClick(e) {
    this.modifPopup.show("modification");
  }

  onCellClick(e) {
    this.modifPopup.show("modification");
  }

  addEDIArticle() {
    this.modifPopup.show("ajout");
  }

  displayCodeBefore(data) {
    return data
      ? (data.code ? data.code : data.id) +
      " - " +
      (data.nomUtilisateur
        ? data.nomUtilisateur
        : data.raisonSocial
          ? data.raisonSocial
          : data.description)
      : null;
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
    }
  }

  onRowPrepared(e) {
    // Highlight canceled orders
    if (["data", "group"].includes(e.rowType)) {
      let data = e.data.items ?? e.data.collapsedItems;
      if (e.rowType === "data") {
        data = e.data;
      } else {
        data = data[0];
      }
      if (data?.ordre?.flagAnnule === true) {
        e.rowElement.classList.add("canceled-orders");
        e.rowElement.title = this.localizeService.localize("ordre-annule");
      }
    }
  }

  onValideChanged(e) {
    if (!e.event) return; // Only user event
  }

  displayIDBefore(data) {
    return data ? data.id + " - " + data.raisonSocial : null;
  }
}
