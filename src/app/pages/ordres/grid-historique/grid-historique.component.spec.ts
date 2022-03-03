import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ApolloTestingModule } from "apollo-angular/testing";
import Utilisateur from "app/shared/models/utilisateur.model";
import { LocalizePipe } from "app/shared/pipes";
import { AuthService } from "app/shared/services";
import { CurrentCompanyService } from "app/shared/services/current-company.service";

import { GridHistoriqueComponent } from "./grid-historique.component";

describe("GridHistoriqueComponent", () => {
    let component: GridHistoriqueComponent;
    let fixture: ComponentFixture<GridHistoriqueComponent>;
    let mockCurrentCompanyService;
    let mockAuthService;

    beforeEach(async(() => {
        mockCurrentCompanyService = jasmine.createSpyObj(["getCompany"]);
        mockCurrentCompanyService.getCompany.and.returnValue({
            id: "SA",
            raisonSocial: "Blue Whale S.A.S.",
        });
        mockAuthService = jasmine.createSpyObj(["currentUser"]);
        mockAuthService.currentUser.and.returnValue({
            nomUtilisateur: "nomTest",
        } as Utilisateur);
        TestBed.configureTestingModule({
            declarations: [GridHistoriqueComponent, LocalizePipe],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                {
                    provide: CurrentCompanyService,
                    useValue: mockCurrentCompanyService,
                },
            ],
            imports: [
                RouterTestingModule,
                HttpClientTestingModule,
                ApolloTestingModule,
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridHistoriqueComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
