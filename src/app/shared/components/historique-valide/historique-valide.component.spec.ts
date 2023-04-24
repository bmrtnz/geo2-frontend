import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { LocalizePipe } from "app/shared/pipes";

import { HistoriqueValideComponent } from "./historique-valide.component";

describe("HistoriqueValideComponent", () => {
    let component: HistoriqueValideComponent;
    let fixture: ComponentFixture<HistoriqueValideComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [HistoriqueValideComponent, LocalizePipe],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HistoriqueValideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
