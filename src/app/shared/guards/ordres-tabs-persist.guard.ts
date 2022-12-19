import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,

  Router,
  RouterStateSnapshot,

  UrlTree
} from "@angular/router";
import { RouteParam } from "app/pages/ordres/root/root.component";
import { Observable } from "rxjs";
import { Societe } from "../models";
import { AuthService } from "../services";
import { CurrentCompanyService } from "../services/current-company.service";

@Injectable()
export class OrdresTabsPersistGuard
  implements CanActivate {
  // private currentCompany: Societe;

  constructor(
    private router: Router,
    private authService: AuthService,
    private currentCompanyService: CurrentCompanyService,
  ) { }

  /**
   * Entering/Restore tabs config, show home tab
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const societe: Societe = this.currentCompanyService?.getCompany();
    const selectedTab = next.paramMap.get(RouteParam.TabID);

    // restore
    if (!selectedTab) {
      const configURL = this.authService.currentUser.configTabsOrdres?.[societe.id];
      if (configURL) {
        const tree = this.router.parseUrl(configURL);
        return this.router.createUrlTree(
          ["/pages/ordres/home"],
          { queryParams: tree.queryParams },
        );
      }
      return this.router.createUrlTree(["/pages/ordres/home"]);
    } else {
      // persist (non-blocking)
      this.authService.persist({
        configTabsOrdres: {
          ...this.authService.currentUser?.configTabsOrdres,
          [societe.id]: encodeURI(state.url),
        },
      }).subscribe();
    }


    return true;
  }

}
