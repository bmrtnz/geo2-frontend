import { Component, EventEmitter, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BaseTarif, Devise, Entrepot, Transporteur } from "app/shared/models";
import { TransporteursService } from "app/shared/services";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { DevisesService } from "app/shared/services/api/devises.service";
import { EntrepotsTransporteursBassinsService } from "app/shared/services/api/entrepots-transporteurs-bassins.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import { Observable } from "rxjs";
import { concatMap, map, takeWhile, tap } from "rxjs/operators";

@Component({
  selector: "app-set-bassin",
  templateUrl: "./set-bassin.component.html",
  styleUrls: ["./set-bassin.component.scss"]
})
export class SetBassinComponent implements OnInit {

  public etbDatasource: DataSource;
  public columns: Observable<GridColumn[]>;
  public contentReadyEvent = new EventEmitter<any>();

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

    // wait until grid columns a ready
    this.contentReadyEvent
      .pipe(takeWhile(event => event.component.columnCount() <= 0, true))
      .subscribe(event => this.bindSources(event));

  }

  bindSources(event) {
    // lookup columns datasource binding
    GridConfiguratorService.bindLookupColumnSource(
      event.component,
      "transporteur.id",
      this.transporteursService.getLookupStore<Transporteur>(["id", "raisonSocial"]),
    );
    GridConfiguratorService.bindLookupColumnSource(
      event.component,
      "baseTarifTransport.id",
      this.basesTarifService.getLookupStore<BaseTarif>(["id", "description"]),
    );
    GridConfiguratorService.bindLookupColumnSource(
      event.component,
      "deviseTarifTransport.id",
      this.devisesService.getLookupStore<Devise>(["id", "description"]),
    );
  }

  private fetchDatasource(entrepotID: Entrepot["id"]) {
    return this.columns.pipe(
      map(columns => columns.flatMap(({ dataField, calculateDisplayValue }) => [dataField, calculateDisplayValue])),
      map(fields => this.etbService.getDataSource_v2([
        ...fields,
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
