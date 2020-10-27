import { CanActivate, ActivatedRouteSnapshot, Router, ActivatedRoute, UrlTree, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class NestedGuard implements CanActivate {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean|UrlTree {
    if (this.router.url.startsWith('/nested')) {
      return this.router.createUrlTree([
        { outlets: { details: decodeURI(state.url.substring(1)) }}
      ], { relativeTo: this.activatedRoute.firstChild.firstChild, });
    }
    return true;
  }

}
