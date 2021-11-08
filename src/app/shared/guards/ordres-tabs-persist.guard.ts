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

  private currentCompanyID: string;

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
    const societe: Societe = this.currentCompanyService.getCompany();
    this.currentCompanyID = societe.id;
    return iif(
      () => !!this.authService.currentUser?.configTabsOrdres?.[this.currentCompanyID],
      defer(() => of(this.authService.currentUser.configTabsOrdres[this.currentCompanyID]))
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
      if (!nextState.url.startsWith('/ordres')) {
        of(this.currentCompanyService.getCompany())
        .pipe(
          switchMap((company: Societe) => this.authService.persist({
            configTabsOrdres: {
              [company.id]: encodeURI(currentState.url),
            },
          })),
          switchMap(() => this.authService.logOut()),
        )
        .toPromise();
      }

      return true;
  }

}
