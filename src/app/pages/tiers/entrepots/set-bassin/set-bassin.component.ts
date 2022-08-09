import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Entrepot, Transporteur } from "app/shared/models";
import { TransporteursService } from "app/shared/services";
import { BureauxAchatService } from "app/shared/services/api/bureaux-achat.service";
import { EntrepotsTransporteursBassinsService } from "app/shared/services/api/entrepots-transporteurs-bassins.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import dxDataGrid from "devextreme/ui/data_grid";
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

  // public bureauGridSelectionChanged(event: { component: dxDataGrid, currentSelectedRowKeys: any[] }) {
  //   event.component.collapseAll(-1);
  //   event.component.expandRow(event.currentSelectedRowKeys[0]);
  // }

  public setStateValue(rowData: any, value: any): void {
    console.log(rowData, value);
    (this as any).defaultSetCellValue(rowData, value);
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
