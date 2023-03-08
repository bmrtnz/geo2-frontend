import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import LitigeLigneFait from "app/shared/models/litige-ligne-fait.model";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import { ColumnsChangeSelection, Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import { defer, from, interval, Observable, of } from "rxjs";
import { concatMap, concatMapTo, delay, filter, map, mapTo, mergeMap, skipWhile, takeUntil, takeWhile, tap, timeout } from "rxjs/operators";
import { GridsService } from "../../grids.service";

@Component({
  selector: "app-grid-lot",
  templateUrl: "./grid-lot.component.html",
  styleUrls: ["./grid-lot.component.scss"]
})
export class GridLotComponent implements OnInit, OnChanges {

  @Input() lot: [Litige["id"], LitigeLigne["numeroGroupementLitige"]];

  @ViewChild(DxDataGridComponent) private grid: DxDataGridComponent;

  public dataSource: DataSource;
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
  }

  ngOnInit(): void {
    this.columns = this.gridConfiguratorService.fetchColumns(Grid.LitigeLignesLot);
    this.gridsService.register("LitigeLignesLot", this.grid);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.lot.currentValue !== changes.lot.previousValue) {
      this.fillGrid(this.gridConfiguratorService.fetchColumns(Grid.LitigeLignesLot));
    }
  }

  private onColumnsChange({ current }: ColumnsChangeSelection) {
    this.columns = of(current);
    this.fillGrid(of(current));
  }

  private async fillGrid(columns: Observable<GridColumn[]>) {
    this.dataSource = await (columns).pipe(
      filter(() => !!this.lot),
      concatMap(resolvedColumns => this.fetchDatasource(resolvedColumns, ...this.lot)),
    ).toPromise();
  }

  private fetchDatasource(
    columns: GridColumn[],
    litigeID: Litige["id"],
    numeroGroupement?: LitigeLigne["numeroGroupementLitige"],
  ) {
    return of(columns).pipe(
      GridConfiguratorService.getVisible(),
      GridConfiguratorService.getFields(),
      map(fields => [
        ...fields,
        "ligne.id",
        "ligne.litige.id",
      ]),
      map(fields =>
        // upgrade fields that require sub selections
        fields.map(field => {
          if (field === "ligne.cause")
            return "ligne.cause.id";
          if (field === "ligne.consequence")
            return "ligne.consequence.id";
          return field;
        })
      ),
      map(fields => this.litigesLignesService
        .allLitigeLigneFaitDatasource(litigeID, numeroGroupement ?? "", new Set(fields))),
    );
  }

  /** Met a jour l'ensemble des lignes de la grille (le lot) avec les données fournies */
  public updateLot(data: Partial<LitigeLigne>) {
    return interval(100)
      .pipe(
        concatMapTo(defer(() => of(this.grid?.dataSource as DataSource))),
        takeWhile(datasource => !datasource?.items()?.length, true),
        filter(datasource => !!datasource?.items()?.length),
        concatMap(datasource => {
          (datasource.items() as Partial<LitigeLigneFait>[]).forEach((item, rowIndex) => {
            Object.entries(data).forEach(([field, value]) => {
              this.grid.instance.cellValue(rowIndex, `ligne.${field}`, value);
            });
          });
          return Promise.resolve();
        }),
        timeout(10000),
      );
  }

  /** Persist grid changes */
  public persist() {
    return defer(() => this.grid.instance.saveEditData());
  }

}
