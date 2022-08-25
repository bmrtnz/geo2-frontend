import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Entrepot } from "app/shared/models";
import { TransporteursService } from "app/shared/services";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { DevisesService } from "app/shared/services/api/devises.service";
import { EntrepotsTransporteursBassinsService } from "app/shared/services/api/entrepots-transporteurs-bassins.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import { Observable } from "rxjs";
import { concatMap, map, tap } from "rxjs/operators";

@Component({
  selector: "app-set-bassin",
  templateUrl: "./set-bassin.component.html",
  styleUrls: ["./set-bassin.component.scss"]
})
export class SetBassinComponent implements OnInit {

  public etbDatasource: DataSource;
  public transporteurs: { store: CustomStore };
  public basesTarif: { store: CustomStore };
  public devises: { store: CustomStore };
  public columns: Observable<GridColumn[]>;
  @ViewChild(DxDataGridComponent) private dataGrid: DxDataGridComponent;

  constructor(
    private etbService: EntrepotsTransporteursBassinsService,
    private transporteursService: TransporteursService,
    private basesTarifService: BasesTarifService,
    private devisesService: DevisesService,
    private gridConfiguratorService: GridConfiguratorService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.columns = this.gridConfiguratorService.fetchColumns(Grid.Bassin);

    this.route.paramMap.pipe(
      concatMap(params => this.fetchDatasource(params.get("id"))),
    ).subscribe(datasource => this.etbDatasource = datasource);

    this.transporteurs = this.transporteursService.getLookupStore(["id", "raisonSocial"]);
    this.basesTarif = this.basesTarifService.getLookupStore(["id", "description"]);
    this.devises = this.devisesService.getLookupStore(["id", "description"]);

  }

  private fetchDatasource(entrepotID: Entrepot["id"]) {
    return this.columns.pipe(
      map(columns => columns.map(({ dataField }) => dataField)),
      map(fields => this.etbService.getDataSource_v2([
        ...fields,
        "transporteur.id", "transporteur.raisonSocial",
        "baseTarifTransport.id", "baseTarifTransport.description",
        "deviseTarifTransport.id", "deviseTarifTransport.description",
      ])),
      tap(datasource => datasource.filter([
        ["valide", "=", true],
        "and",
        ["entrepot.id", "=", entrepotID],
      ]))
    );
  }

  public onSaved(event: { changes: any[]; }) {
    (this.etbDatasource.store() as CustomStore).push(event.changes);
  }

}
