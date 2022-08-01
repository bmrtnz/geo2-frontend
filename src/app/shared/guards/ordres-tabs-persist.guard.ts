import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanDeactivate,
  Router,
  RouterStateSnapshot,
  UrlSerializer,
  UrlTree
} from "@angular/router";
import { RootComponent } from "app/pages/ordres/root/root.component";
import { defer, Observable, of } from "rxjs";
import { catchError, concatMap, map, switchMap } from "rxjs/operators";
import { Societe } from "../models";
import { AuthService } from "../services";
import { CurrentCompanyService } from "../services/current-company.service";

@Injectable()
export class OrdresTabsPersistGuard
  implements CanActivate, CanDeactivate<RootComponent> {
  private currentCompany: Societe;

  constructor(
    private router: Router,
    private authService: AuthService,
    private currentCompanyService: CurrentCompanyService,
    private URLSerializer: UrlSerializer,
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
    this.currentCompany = societe;
    return defer(() =>
      of(this.authService.currentUser.configTabsOrdres[this.currentCompany.id]),
    ).pipe(
      concatMap(url => {
        if (!url.startsWith("/pages/ordres/"))
          throw Error("Invalid ordre-tabs configuration");
        if (!Object.keys(this.URLSerializer.parse(url).queryParams).length)
          throw Error("No query params found in the ordre-tabs configuration");
        return of(this.router.parseUrl(url));
      }),
      map(urlTree => this.router.createUrlTree(
        ["/pages/ordres/home"],
        { queryParams: urlTree.queryParams },
      )),
      catchError(err => {
        console.warn(err);
        return of(this.router.createUrlTree(["/pages/ordres/home"]));
      }),
    );
  }

  /**
   * Quitting/Save tabs config
   */
  canDeactivate(
    component: RootComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // Trigger save, but don't block navigation
    of(
      this?.currentCompany?.id ??
      this?.currentCompanyService?.getCompany()?.id,
    )
      .pipe(
        switchMap((companyID) =>
          this.authService.persist({
            configTabsOrdres: {
              ...this.authService.currentUser?.configTabsOrdres,
              [companyID]: encodeURI(
                nextState.url.match(/^\/pages\/ordres.*/)
                  ? nextState.url
                  : currentState.url,
              ),
            },
          }),
        ),
      )
      .toPromise();

    return true;
  }
}
