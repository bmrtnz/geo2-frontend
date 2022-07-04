import { Injectable } from "@angular/core";
import { DxDataGridComponent } from "devextreme-angular";

type OrdreGridId =
  | "Commande"
  | "SyntheseExpeditions"
  | "DetailExpeditions";

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
    ids.forEach(id => this.grids[id].instance.refresh());
  }
}
