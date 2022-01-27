import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RootComponent } from 'app/pages/ordres/root/root.component';
import { defer, iif, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Societe } from '../models';
import { AuthService } from '../services';
import { CurrentCompanyService } from '../services/current-company.service';

@Injectable()
export class OrdresTabsPersistGuard implements CanActivate, CanDeactivate<RootComponent> {

  private currentCompany: Societe;

  constructor(
    private router: Router,
    private authService: AuthService,
    private currentCompanyService: CurrentCompanyService,
  ) {}

  /**
   * Entering/Restore tabs config
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
    return iif(
      () => !!this.authService.currentUser?.configTabsOrdres?.[this?.currentCompany?.id],
        defer(() => of(this.authService.currentUser.configTabsOrdres[this.currentCompany.id]))
        .pipe(map( url => this.router.parseUrl(url))),
        of(this.router.createUrlTree(['/ordres/home'])),
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
      of(this?.currentCompany?.id ?? this?.currentCompanyService?.getCompany()?.id)
      .pipe(
        switchMap(companyID => this.authService.persist({
          configTabsOrdres: {
            ...this.authService.currentUser?.configTabsOrdres,
            [companyID]: encodeURI(nextState.url.match(/^\/ordres.*/) ? nextState.url : currentState.url),
          },
        })),
      )
      .toPromise();

      return true;
  }

}
