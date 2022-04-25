import { Component, EventEmitter, Input, OnInit, ViewChild } from "@angular/core";
import { AuthService, LocalizationService } from "app/shared/services";
import { EnvoisService } from "app/shared/services/api/envois.service";
import { FluxService } from "app/shared/services/api/flux.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { ImprimantesService } from "app/shared/services/api/imprimantes.service";
import { MoyenCommunicationService } from "app/shared/services/api/moyens-communication.service";
import { SocietesService } from "app/shared/services/api/societes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map, takeWhile } from "rxjs/operators";

@Component({
  selector: "app-grid-choix-envois",
  templateUrl: "./grid-choix-envois.component.html",
  styleUrls: ["./grid-choix-envois.component.scss"]
})

export class GridChoixEnvoisComponent implements OnInit {

  @Input() public ordreID: string;
  @Input() public fluxID: string;
  @Input() public fournisseurCode: string;
  @Input() public transporteurLigneId: string;
  @Input() public lieupassageaquaiLigneId: string;

  readonly CHOIX_ENVOIS_FIELDS = [
    "id",
    "typeTiers.description",
    "flux.description",
    "moyenCommunication.id",
    "numeroAcces1",
    "imprimante.id",
    "nomContact",
    "commentairesAvancement",
    "dateEnvoi",
    // "modifLignes",
    // "modifEntete",
    // "lieuPassage",
  ];

  dataSource: any;
  rowKeys: any[];
  fluxSource: DataSource;
  societeSource: DataSource;
  moyenCommunicationSource: DataSource;
  imprimanteSource: DataSource;
  codeTiers: string;
  typeTiers: string;
  typeTiersLabel: string;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  contentReadyEvent = new EventEmitter<any>();

  constructor(
    public societeService: SocietesService,
    public fluxService: FluxService,
    public imprimanteService: ImprimantesService,
    public moyenCommunicationService: MoyenCommunicationService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
    private functionsService: FunctionsService,
    private envoisService: EnvoisService,
  ) { }

  ngOnInit() {

    this.societeSource = this.societeService.getDataSource();
    this.fluxSource = this.fluxService.getDataSource();
    this.moyenCommunicationSource = this.moyenCommunicationService.getDataSource();
    this.imprimanteSource = this.imprimanteService.getDataSource_v2(["id", "description"]);
    this.imprimanteSource.filter(["valide", "=", true]);

    // Léa 09/2021
    // Moyen : les moyens EDIFACT et FTP ne doivent pas pouvoir être ajoutés par les utilisateurs de base (uniquement par les admin)
    // Flux : les flux FACTUR et FACDUP ne doivent pas pouvoir être ajoutés par les utilisateurs de base (uniquement par les admin)
    if (!this.authService.currentUser.adminClient) {
      this.moyenCommunicationSource.filter([["id", "<>", "FTP"], "and", ["id", "<>", "EFT"]]);
      this.fluxSource.filter([["id", "<>", "FACDUP"], "and", ["id", "<>", "FACTUR"]]);
    }

    if (!this.dataGrid.dataSource) {
      this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.ChoixEnvois);
      this.columns = from(this.gridConfig).pipe(map(config => config.columns));

      // const fields = this.columns.pipe(map(columns => columns.map(column => {
      //   let field = column.dataField;
      //   if (field === "moyenCommunication")
      //     field += `.${this.moyenCommunicationService.model.getKeyField()}`;
      //   if (field === "imprimante")
      //     field += `.${this.imprimanteService.model.getKeyField()}`;
      //   return field;
      // })));
    }

    this.functionsService.geoPrepareEnvois(
      this.ordreID,
      this.fluxID,
      true,
      false,
      this.authService.currentUser.nomUtilisateur,
    )
      .valueChanges
      .pipe(
        takeWhile(res => res.loading),
      )
      .subscribe({
        complete: () => {
          console.log("complete");
          const datasource = this.envoisService.getDataSource_v2(this.CHOIX_ENVOIS_FIELDS);
          datasource.filter([
            ["ordre.id", "=", this.ordreID],
          ]);
          this.dataGrid.dataSource = datasource;
        },
        next: (res) => {
          console.log(res);
        },
        error: message => notify({ message }, "error", 7000),
      });

  }

  displayIDBefore(data) {
    return data
      ? data.id +
      " - " +
      (data.nomUtilisateur
        ? data.nomUtilisateur
        : data.raisonSocial
          ? data.raisonSocial
          : data.description)
      : null;
  }

  onRowClick({ rowIndex }) {
    this.dataGrid.instance.editRow(rowIndex);
  }

  onValueChanged(event, cell) {
    if (cell.setValue)
      cell.setValue(event.value);
  }

  deleteSelectedRows() {
    const message = this.localizeService.localize("text-popup-supprimer-element" + (this.rowKeys.length > 1 ? "s" : ""));
    const result = confirm(message, "Suppression" + (this.rowKeys.length > 1 ? " par lot" : ""));
    result.then((toDelete) => {
      if (toDelete) {
        this.rowKeys.forEach((key) => {
          this.dataSource.splice(this.dataSource.indexOf(key), 1);
        });
        this.dataGrid.instance.refresh();
      }
    });
  }

  onSelectionChanged() {
    this.rowKeys = this.dataGrid.instance.getSelectedRowKeys();
  }

}
