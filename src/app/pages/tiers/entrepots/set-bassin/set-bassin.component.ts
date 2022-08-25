import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Entrepot, Transporteur } from "app/shared/models";
import { TransporteursService } from "app/shared/services";
import { EntrepotsTransporteursBassinsService } from "app/shared/services/api/entrepots-transporteurs-bassins.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
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
  public transporteurs: Observable<Transporteur[]>;
  public columns: Observable<GridColumn[]>;
  // @ViewChild("bureauxAchatsGrid") private bureauxAchatsGrid: DxDataGridComponent;

  constructor(
    private etbService: EntrepotsTransporteursBassinsService,
    private transporteursService: TransporteursService,
    private gridConfiguratorService: GridConfiguratorService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.columns = this.gridConfiguratorService.fetchColumns(Grid.Bassin);

    this.route.paramMap.pipe(
      concatMap(params => this.fetchDatasource(params.get("id"))),
    ).subscribe(datasource => this.etbDatasource = datasource);

    this.transporteurs = this.transporteursService
      .getList("valide==true", ["id", "raisonSocial"])
      .pipe(map(res => res.data.allTransporteurList));
  }

  private fetchDatasource(entrepotID: Entrepot["id"]) {
    return this.columns.pipe(
      map(columns => columns.map(({ dataField }) => dataField)),
      map(fields => this.etbService.getDataSource_v2([
        ...fields,
        "transporteur.id", "transporteur.raisonSocial",
      ])),
      tap(datasource => datasource.filter([
        ["valide", "=", true],
        "and",
        ["entrepot.id", "=", entrepotID],
      ]))
    );
  }

}
