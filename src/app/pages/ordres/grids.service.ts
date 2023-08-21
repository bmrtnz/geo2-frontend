import { Injectable } from "@angular/core";
import { ONE_MINUTE } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import notify from "devextreme/ui/notify";

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

  /**
   * Register grid instance for future actions
   * @param id Grid identifier
   * @param component Grid component
   */
  public register(id: OrdreGridId, component: DxDataGridComponent, order?) {
    const key = id + (order ?? "");
    this.grids[id + (order ?? "")] = component;
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

  public waitUntilAllGridDataSaved(grid) {
    if (!grid?.instance.hasEditData()) return Promise.resolve();

    grid.instance.saveEditData();
    return new Promise<void>((resolve, reject) => {
      // Wait until grid has been totally saved
      const saveTimeout = setTimeout(() => {
        notify("Erreur sauvegarde grille cde", "error");
        clearInterval(saveInterval);
        reject();
      }, 2 * ONE_MINUTE)
      const saveInterval = setInterval(() => {
        if (!grid.instance.hasEditData()) {
          clearInterval(saveInterval);
          clearTimeout(saveTimeout);
          resolve();
        }
      }, 100);
    });
  }

}
