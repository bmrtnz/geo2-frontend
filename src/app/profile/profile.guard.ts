import { Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,



    CanActivateChild, Router,
    RouterStateSnapshot,
    UrlTree
} from "@angular/router";
import { AuthService } from "app/shared/services";

@Injectable({
    providedIn: "root",
})
export class ProfileGuard implements CanActivate, CanActivateChild {
    constructor(private router: Router, private authService: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.checkAuth(state);
    }

    canActivateChild(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ) {
        return this.checkAuth(state);
    }

    checkAuth(state: RouterStateSnapshot): boolean | UrlTree {
        const isLoggedIn = this.authService.isLoggedIn;

        if (!isLoggedIn)
            return this.authService.createLoginRedirectURLTree(state.url);

        return isLoggedIn;
    }
}
