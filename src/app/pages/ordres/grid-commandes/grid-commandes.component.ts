import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { Change, GridColumn, OnSavingEvent } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { Observable, of } from "rxjs";
import { concatMap, filter, first, map, tap } from "rxjs/operators";

@Component({
  selector: "app-grid-commandes",
  templateUrl: "./grid-commandes.component.html",
  styleUrls: ["./grid-commandes.component.scss"]
})
export class GridCommandesComponent implements OnInit, OnChanges {

  constructor(
    private gridConfigurator: GridConfiguratorService,
    private ordresService: OrdresService,
    private ordreLignesService: OrdreLignesService,
    private route: ActivatedRoute,
    private currentCompanyService: CurrentCompanyService,
  ) { }

  public readonly gridID = Grid.LignesCommandes;
  public columns: Observable<GridColumn[]>;
  public allowMutations = false;
  public changes: Change<Partial<OrdreLigne>>[] = [];

  @Input() ordreID: string;
  @ViewChild(DxDataGridComponent) private grid: DxDataGridComponent;

  public gridConfigHandler = event =>
    this.gridConfigurator.init(this.gridID, {
      ...event,
      onColumnsChange: this.onColumnsConfigurationChange.bind(this),
    })

  ngOnInit(): void {
    this.route.paramMap
      .pipe(filter(params => params.has("ordre_id")))
      .subscribe({
        next: params => {
          this.ordreID = params.get("ordre_id");
          this.updateRestrictions();
        },
      });
    this.columns = this.gridConfigurator.fetchColumns(this.gridID);
  }

  async ngOnChanges({ ordreID }: SimpleChanges) {
    if (ordreID.currentValue) this.updateRestrictions();
  }

  focusedColumnIndexChange() {
    this.grid.instance.saveEditData();
  }

  onSaving(event: OnSavingEvent) {
    if (event.component.hasEditData()) {
      while (this?.changes.length) {

        if (this?.changes[0]?.type !== "update") continue;

        const change = this.changes.shift();
        event.cancel = true;
        event.promise = new Promise((rsv, rjt) => {

          const source = this.grid.dataSource as DataSource;
          const store = source.store() as CustomStore;

          // push initial cell change to prevent data flickering
          store.push([change]);

          /* tslint:disable-next-line:prefer-const */
          let [name, value] = Object.entries(change.data)[0];

          // request mutation
          this.columns
            .pipe(
              GridConfiguratorService.getVisible(),
              GridConfiguratorService.getFields(),
              concatMap(fields => this.ordreLignesService.updateField(
                name,
                value,
                change.key,
                this.currentCompanyService.getCompany().id,
                ["id", ...fields],
              )),
              first(),
            )
            .subscribe({

              // build and push response data
              next: ({ data }) => {
                store.push([{
                  key: data.updateField.id,
                  type: "update",
                  data: data.updateField,
                }]);
              },

              // reject on error
              error: err => {
                notify(err.message, "error", 5000);
                rjt(err);
              },

              // optionnal chaining
              complete: async () => {
                await this.grid.instance.saveEditData();
                rsv();
              },
            });
        });
      }
    }
  }

  onColumnsConfigurationChange({ current }: { current: GridColumn[] }) {
    this.refreshData(current);
  }

  private refreshData(columns: GridColumn[]) {
    this.columns = of(columns);
    if (this.ordreID)
      this.columns
        .pipe(
          GridConfiguratorService.getVisible(),
          GridConfiguratorService.getFields(),
          map(fields => this.ordreLignesService.getListDataSource([
            OrdreLigne.getKeyField() as string,
            ...fields,
          ])),
          tap(datasource => datasource.filter([
            ["ordre.id", "=", this.ordreID],
            "and",
            ["valide", "=", true],
            "and",
            ["article.id", "isnotnull", "null"]
          ])),
        )
        .subscribe(datasource => {
          this.grid.dataSource = datasource;
        });
  }

  private async updateRestrictions() {
    const isCloture = await this.ordresService.isCloture({ id: this.ordreID });
    this.allowMutations = !environment.production && !isCloture;
  }

}
