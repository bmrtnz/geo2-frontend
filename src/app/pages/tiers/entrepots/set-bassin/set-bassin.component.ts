import { Component, EventEmitter, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BaseTarif, BureauAchat, Devise, Entrepot, Transporteur } from "app/shared/models";
import { TransporteursService } from "app/shared/services";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { BureauxAchatService } from "app/shared/services/api/bureaux-achat.service";
import { DevisesService } from "app/shared/services/api/devises.service";
import { EntrepotsTransporteursBassinsService } from "app/shared/services/api/entrepots-transporteurs-bassins.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
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
  @ViewChild(DxDataGridComponent) private grid: DxDataGridComponent;

  constructor(
    private etbService: EntrepotsTransporteursBassinsService,
    private bureauxAchatService: BureauxAchatService,
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

  /** lookup columns datasource binding */
  bindSources(event) {
    GridConfiguratorService.bindLookupColumnSource(
      event.component,
      "bureauAchat.id",
      this.bureauxAchatService.getLookupStore<BureauAchat>(["id", "raisonSocial"], "valide==true"),
    );
    GridConfiguratorService.bindLookupColumnSource(
      event.component,
      "transporteur.id",
      this.transporteursService.getLookupStore<Transporteur>(["id", "raisonSocial"], "valide==true"),
    );
    GridConfiguratorService.bindLookupColumnSource(
      event.component,
      "baseTarifTransport.id",
      this.basesTarifService.getLookupStore<BaseTarif>(["id", "description"], "valide==true"),
    );
    GridConfiguratorService.bindLookupColumnSource(
      event.component,
      "deviseTarifTransport.id",
      this.devisesService.getLookupStore<Devise>(["id", "description"], "valide==true"),
    );
  }

  private fetchDatasource(entrepotID: Entrepot["id"]) {
    return this.columns.pipe(
      map(columns => columns.map(({ dataField, calculateDisplayValue }) => [dataField, calculateDisplayValue]).flat(2)),
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

  public onInserting(event) {
    event.data.entrepot = { id: this.route.snapshot.paramMap.get("id") } as { id: string } & Partial<Entrepot>;
    event.data.valide = true;
  }

  public onSaved(event: { changes: any[]; }) {
    (this.etbDatasource.store() as CustomStore).push(event.changes);
  }

}
