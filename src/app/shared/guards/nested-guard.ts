import { CanActivate, ActivatedRouteSnapshot, Router, ActivatedRoute, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class NestedGuard implements CanActivate {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  canActivate(next: ActivatedRouteSnapshot): boolean|UrlTree {
    if (this.router.url.startsWith('/nested')) {
      return this.router.createUrlTree([
        { outlets: { details: next.url.map(({path}) => path).join('/') }}
      ], { relativeTo: this.activatedRoute.firstChild.firstChild });
    }
    return true;
  }

}
