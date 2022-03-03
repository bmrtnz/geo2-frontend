import { TestBed } from "@angular/core/testing";

import { OrdresLogistiquesService } from "./ordres-logistiques.service";

describe("OrdresLogistiquesService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: OrdresLogistiquesService = TestBed.inject(
            OrdresLogistiquesService,
        );
        expect(service).toBeTruthy();
    });
});
