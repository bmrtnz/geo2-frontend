import { AfterViewInit, Component, OnInit, Output, ViewChild } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, NgForm } from "@angular/forms";
import { GridsService } from "app/pages/ordres/grids.service";
import {
  AuthService,
  ClientsService,
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
  clientCode = "client",
  search = "dateDepartPrevueFournisseur",
}

type Inputs<T = any> = { [key in keyof typeof FormInput]: T };

@Component({
  selector: 'app-grid-articles-edi-colibri',
  templateUrl: './grid-articles-edi-colibri.component.html',
  styleUrls: ['./grid-articles-edi-colibri.component.scss']
})
export class GridArticlesEdiColibriComponent implements OnInit, AfterViewInit {

  @Output() public article: any;

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild(ModificationArticleEdiPopupComponent) private modifPopup: ModificationArticleEdiPopupComponent;
  @ViewChild("filterForm") filterForm: NgForm;

  private gridConfig: Promise<GridConfig>;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public ordresDataSource: DataSource;
  public clients: DataSource;

  public formGroup = new UntypedFormGroup({
    valide: new UntypedFormControl(),
    clientCode: new UntypedFormControl(),
    search: new UntypedFormControl()
  } as Inputs<UntypedFormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public clientsService: ClientsService,
    public authService: AuthService,
    public gridsService: GridsService,
    public localizeService: LocalizationService,
    public dateManagementService: DateManagementService,
    private currentCompanyService: CurrentCompanyService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchConfig(
      Grid.GestionArticleEdi
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.clients = this.clientsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "valide",
    ]);
    const filter: any = [
      ["societe.id", "=", this.currentCompanyService.getCompany().id],
      "and",
      ["valide", "=", true]
    ];
    // Admin: do not filter vs comm sector
    if (!this.authService.isAdmin && this.authService.currentUser.secteurCommercial) {
      filter.push("and", ["secteur.id", "=", this.authService.currentUser.secteurCommercial.id])
    };
    this.clients.filter(filter);
  }

  async ngOnInit() {
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );

    // this.ordresDataSource = this.planningTransporteursService.getDataSource_v2(
    //   await fields.toPromise()
    // );
  }

  ngAfterViewInit() {
    // Only way found to validate and show Warning icon
    this.formGroup.get("clientCode").setValue("");
    this.formGroup.get("clientCode").reset();
    this.formGroup.get("valide").setValue(true);
  }

  enableFilters() {
    if (!this.formGroup.get("clientCode").value) {
      notify(this.localizeService.localize("please-select-client"), "error", 1500);
    } else {
      const values: Inputs = {
        ...this.formGroup.value,
      };

      this.datagrid.dataSource = this.ordresDataSource;
    }
  }

  onRowDblClick(e) {
    this.article = e?.data;
    this.modifPopup.show("modification");
  }

  onCellClick(e) {
    // FAKE // A VIRER !!
    this.article = {
      valide: true,
      codeArtBW: "034579",
      GTINArtClient: "54654646464",
      codeArtClient: "F4566",
      prioriteBox: 6
    }
    this.modifPopup.show("modification");// A VIRER !!
  }

  addEDIArticle() {
    this.article = null;
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

  }

  onValideChanged(e) {
    if (!e.event) return; // Only user event
  }

}
