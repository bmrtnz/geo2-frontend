import { TestBed } from "@angular/core/testing";

import { IdentificationsSymboliquesService } from "./identifications-symboliques.service";

describe("IdentificationsSymboliquesService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: IdentificationsSymboliquesService = TestBed.inject(
            IdentificationsSymboliquesService,
        );
        expect(service).toBeTruthy();
    });
});
