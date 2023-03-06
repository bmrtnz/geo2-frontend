import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import LitigeLigneFait from "app/shared/models/litige-ligne-fait.model";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import { from, interval, Observable, of } from "rxjs";
import { concatMap, filter, map, mapTo, skipWhile, takeUntil, takeWhile, tap } from "rxjs/operators";
import { GridsService } from "../../grids.service";

@Component({
  selector: "app-grid-lot",
  templateUrl: "./grid-lot.component.html",
  styleUrls: ["./grid-lot.component.scss"]
})
export class GridLotComponent implements OnInit, OnChanges {

  @Input() lot: [Litige["id"], LitigeLigne["numeroGroupementLitige"]];

  @ViewChild(DxDataGridComponent) private grid: DxDataGridComponent;

  public columns: Observable<GridColumn[]>;
  public gridConfigHandler = event =>
    this.gridConfiguratorService.init(Grid.LitigeLignesLot, {
      ...event,
      onColumnsChange: this.onColumnsChange.bind(this),
    })

  constructor(
    private litigesLignesService: LitigesLignesService,
    private gridConfiguratorService: GridConfiguratorService,
    private gridsService: GridsService,
  ) {
    this.columns = this.gridConfiguratorService.fetchColumns(Grid.LitigeLignesLot);
  }

  ngOnInit(): void {
    this.gridsService.register("LitigeLignesLot", this.grid);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.lot.currentValue !== changes.lot.previousValue && this.grid) {
      this.fillGrid();
    }
  }

  private onColumnsChange({ current }: { current: GridColumn[] }) {
    this.columns = of(current);
    this.fillGrid(of(current));
  }

  private async fillGrid(columns?: Observable<GridColumn[]>) {
    this.grid.dataSource = await (columns ?? this.columns).pipe(
      filter(() => !!this.lot),
      concatMap(c => this.fetchDatasource(...this.lot, c)),
    ).toPromise();
  }

  private fetchDatasource(
    litigeID: Litige["id"],
    numeroGroupement: LitigeLigne["numeroGroupementLitige"],
    columns: GridColumn[],
  ) {
    return of(columns).pipe(
      GridConfiguratorService.getVisible(),
      GridConfiguratorService.getFields(),
      map(fields => [
        ...fields,
        "ligne.id",
        "ligne.litige.id",
        "ligne.ordreLigne.id",
        "ligne.numeroGroupementLitige",
      ]),
      map(fields => this.litigesLignesService
        .allLitigeLigneFaitDatasource(litigeID, numeroGroupement ?? "", new Set(fields))),
    );
  }

  /** Met a jour l'ensemble des lignes du lot avec les données fournies */
  public updateLot(data: Partial<LitigeLigne>) {
    return interval(1000)
      .pipe(
        mapTo(this.grid?.dataSource as DataSource),
        takeWhile(datasource => !datasource, true),
        filter(datasource => !!datasource),
        tap(datasource => (datasource.store() as CustomStore)
          .push(datasource.items().map(llf => ({
            type: "update",
            key: llf.ligne.id,
            data: { ligne: data },
          })))),
      );
  }

  /** Persist grid changes */
  public persist() {
    return from(this.grid.instance.saveEditData());
  }

}
