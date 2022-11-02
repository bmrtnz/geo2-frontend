import { Injectable } from "@angular/core";
import { DxDataGridComponent } from "devextreme-angular";

type OrdreGridId =
  | "Commande"
  | "SyntheseExpeditions"
  | "DetailExpeditions"
  | "CommandesEdi";

/**
 * Helper service to perform actions on datagrids
 */
@Injectable()
export class GridsService {

  private grids: { [key: number]: DxDataGridComponent } = {};

  /**
   * Register grid instance for future actions
   * @param id Grid identifier
   * @param component Grid component
   */
  public register(id: OrdreGridId, component: DxDataGridComponent) {
    this.grids[id] = component;
  }

  /**
   * Call "refresh" on each provided grid
   * @param ids List of grid identifiers
   */
  public reload(...ids: (OrdreGridId)[]) {
    ids.forEach(id => this.grids[id]?.instance.refresh());
  }

  /**
   * Return the grid component if it is registered, undefined otherwise
   * @param id Grid identifier
   */
  public get(id: OrdreGridId) {
    return this.grids[id] as DxDataGridComponent;
  }

  /**
   * Expand/collapse all grid groups (specific button on the grid)
   */
  public expandCollapseGroups(that) {
    if (!that.datagrid) return;
    that.datagrid.instance.option(
      "grouping",
      { autoExpandAll: !that.datagrid.instance.option("grouping").autoExpandAll }
    );
    that.datagrid.instance.option(
      "masterDetail",
      { autoExpandAll: !that.datagrid.instance.option("masterDetail").autoExpandAll }
    );
  }
}
