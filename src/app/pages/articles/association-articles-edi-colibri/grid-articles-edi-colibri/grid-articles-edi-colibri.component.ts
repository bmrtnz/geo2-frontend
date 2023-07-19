import { AfterViewInit, Component, OnInit, Output, ViewChild } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, NgForm } from "@angular/forms";
import { Data } from "@angular/router";
import { GridsService } from "app/pages/ordres/grids.service";
import EdiArticleClient from "app/shared/models/article-edi.model";
import {
  ArticlesService,
  AuthService,
  ClientsService,
  LocalizationService,
} from "app/shared/services";
import { ArticlesEdiService } from "app/shared/services/api/articles-edi.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
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
  client = "client",
  search = "search",
}

type Inputs<T = any> = { [key in keyof typeof FormInput]: T };

@Component({
  selector: 'app-grid-articles-edi-colibri',
  templateUrl: './grid-articles-edi-colibri.component.html',
  styleUrls: ['./grid-articles-edi-colibri.component.scss']
})
export class GridArticlesEdiColibriComponent implements OnInit, AfterViewInit {

  @Output() public EdiArticle: Partial<EdiArticleClient>;
  @Output() public clientId: string;

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild(ModificationArticleEdiPopupComponent) private modifPopup: ModificationArticleEdiPopupComponent;
  @ViewChild("filterForm") filterForm: NgForm;

  private gridConfig: Promise<GridConfig>;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public dataSource: DataSource;
  public clients: DataSource;
  public gridHasData: boolean;

  public formGroup = new UntypedFormGroup({
    client: new UntypedFormControl(),
    valide: new UntypedFormControl(),
    search: new UntypedFormControl()
  } as Inputs<UntypedFormControl>);

  readonly specialFields = [
    "client.id"
  ];

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public clientsService: ClientsService,
    public articlesEdiService: ArticlesEdiService,
    public authService: AuthService,
    public gridsService: GridsService,
    public localizeService: LocalizationService,
    public dateManagementService: DateManagementService,
    private currentCompanyService: CurrentCompanyService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchConfig(
      Grid.AssociationArticleEdi
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

    this.dataSource = this.articlesEdiService.getDataSource_v2(
      new Set([...this.specialFields, ...await fields.toPromise()])
    );
  }

  ngAfterViewInit() {
    // Only way found to validate and show Warning icon
    this.formGroup.get("client").setValue("");
    this.formGroup.get("client").reset();

    this.formGroup.get("valide").setValue(true);

    // this.formGroup.get("client").patchValue("000463"); // A VIRER !!
    // setTimeout(() => this.enableFilters(), 500); // A VIRER !!
  }


  refreshGrid() {
    this.datagrid.instance.refresh();
  }

  enableFilters() {
    if (!this.formGroup.get("client").value) {
      notify(this.localizeService.localize("please-select-client"), "error", 1500);
    } else {
      const values: Inputs = {
        ...this.formGroup.value,
      };
      const filter = [];
      filter.push(["client.id", "=", values.client]);
      if (values.valide) filter.push("and", ["valide", "=", values.valide]);
      if (values.search?.length) {
        filter.push(
          "and",
          [["article.id", "contains", values.search],
            "or",
          ["article.normalisation.articleClient", "contains", values.search],
            "or",
          ["gtinColisClient", "contains", values.search]]
        );
      }
      this.dataSource.filter(filter);
      this.datagrid.dataSource = this.dataSource;
    }
  }

  onContentReady(e) {
    this.gridHasData = (this.datagrid.dataSource as DataSource)?.items()?.length > 0;
  }

  onRowDblClick(e) {
    this.EdiArticle = e?.data;
    this.modifPopup.show("modification");
  }

  onCellClick(e) {
    if (e.rowType !== "data") return;
    if (e.column?.dataField === "valide") {
      if (!e.data.article.valide && !e.value) {
        notify(this.localizeService.localize("warn-article-non-valid", e.data.article.id), "warning", 5000);
      } else {
        // Change valide status & save it
        // Reload DS
        const ediArticleClient = {
          id: e.data.id,
          valide: !e.data.valide
        }

        this.articlesEdiService.save(new Set(["id", "valide"]), ediArticleClient).subscribe({
          next: () => {
            notify(
              `${this.localizeService.localize("ordresEdi-article-id")} ${e.data.article.id} ${this.localizeService.localize(e.data.valide ? "desactive" : "active")}`,
              "success"
            ),
              this.refreshGrid();
          },
          error: () =>
            notify("Erreur lors de la modification du statut", "error", 3000),
        });
      }
    }
  }

  addEDIArticle() {
    const lignesDS = (this.datagrid.dataSource as DataSource)?.items();
    if (lignesDS?.length) {
      this.EdiArticle = null;
      this.clientId = lignesDS[0].client?.id;
      this.modifPopup.show("ajout");
    }
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
      if (e.column.dataField === "valide") {
        if (e.value)
          e.cellElement.classList.add("validity");
        e.cellElement.classList.add("cursor-pointer")
      }
    }
  }

  onValideChanged(e) {
    if (!e.event) return; // Only user event
    this.enableFilters();
  }

}
