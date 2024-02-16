import { Injectable } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { GridColumn, ONE_MINUTE } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import dxDataGrid from "devextreme/ui/data_grid";
import notify from "devextreme/ui/notify";
import hideToasts from "devextreme/ui/toast/hide_toasts";
import { Observable } from "rxjs";

type OrdreGridId =
  | "Commande"
  | "SyntheseExpeditions"
  | "DetailExpeditions"
  | "Logistique"
  | "CommandesEdi"
  | "GroupageChargement"
  | "OrdreMarge"
  | "LitigeLigne"
  | "LitigeLignesLot"
  | "TotauxDetail"
  | "DetailPalettes"
  | "Frais"
  | "Envois"
  | "CQ"
  | "Commentaires"
  | "Log";

/**
 * Helper service to perform actions on datagrids
 */
@Injectable()

export class GridsService {
  private grids: { [key: string]: DxDataGridComponent } = {};

  constructor(
    private localizationService: LocalizationService,
  ) {

  }

  /**
   * Register grid instance for future actions
   * @param id Grid identifier
   * @param component Grid component
   */
  public register(id: OrdreGridId, component: DxDataGridComponent, order?) {
    const key = id + (order ?? "");
    this.grids[key] = component;
  }

  /**
   * Call "refresh" on each provided grid
   * @param ids List of grid identifiers
   */
  public reload(ids: OrdreGridId[], order?) {
    ids.map((id) => this.grids[id + (order ?? "")]?.instance.refresh());
  }

  /**
   * Return the grid component if it is registered, undefined otherwise
   * @param id Grid identifier
   */
  public get(id: OrdreGridId, order?) {
    return this.grids[id + (order ?? "")] as DxDataGridComponent;
  }

  public getAllGrids() {
    return this.grids;
  }

  /**
   * Return identifier like '22-567896' from ordre
   */
  orderIdentifier(ordre) {
    if (!ordre) return null;
    return `${ordre.campagne?.id}-${ordre.numero}`;
  }

  /**
   * Expand/collapse all grid groups (specific button on the grid)
   */
  public expandCollapseGroups(that, masterDetail = true) {
    if (!that.datagrid) return;
    that.datagrid.instance.option("grouping", {
      autoExpandAll: !that.datagrid.instance.option("grouping").autoExpandAll,
    });
    if (masterDetail)
      that.datagrid.instance.option("masterDetail", {
        autoExpandAll:
          !that.datagrid.instance.option("masterDetail").autoExpandAll,
      });
  }

  /**
   * Wait until grid data has been saved
   */
  public waitUntilAllGridDataSaved(grid, message = false) {
    if (!grid?.instance.hasEditData()) return Promise.resolve();
    if (message) {
      notify({
        message: this.localizationService.localize("data-saving-process"),
        displayTime: 999999
      },
        { position: 'bottom center', direction: 'up-stack' }
      );
    }
    setTimeout(() => grid.instance.saveEditData());
    return new Promise<void>((resolve, reject) => {
      // Wait until grid has been totally saved
      const saveTimeout = setTimeout(() => {
        notify("Erreur sauvegarde grille cde", "error");
        clearInterval(saveInterval);
        reject();
      }, 2 * ONE_MINUTE)
      const saveInterval = setInterval(() => {
        if (!grid.instance.hasEditData()) {
          if (message) hideToasts();
          clearInterval(saveInterval);
          clearTimeout(saveTimeout);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Clear all columns' filter value displayed in the filter row.
   */
  public clearFilters(datagrid: dxDataGrid, columns: Observable<GridColumn[]>) {
    if (!datagrid) return;
    columns.subscribe((columns) => columns.map(column => {
      datagrid.columnOption(column.dataField, "filterValue", null);
    }));
  }

}
