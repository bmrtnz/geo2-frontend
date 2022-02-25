import { CanActivate, ActivatedRouteSnapshot, Router, ActivatedRoute, UrlTree, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NestedGuard implements CanActivate {

  private readonly PREFIX = '/pages/';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean|UrlTree {
    if (this.router.url.startsWith(`${this.PREFIX}nested`)) {
      return this.router.createUrlTree([
        { outlets: { details: decodeURI(state.url.substring(this.PREFIX.length)) }}
      ], { relativeTo: this.activatedRoute.firstChild.firstChild.firstChild.firstChild, });
    }
    return true;
  }

}
