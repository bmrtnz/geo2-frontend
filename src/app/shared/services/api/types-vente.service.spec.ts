import { TestBed } from "@angular/core/testing";

import { TypesVenteService } from "./types-vente.service";

describe("TypesVenteService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: TypesVenteService = TestBed.inject(TypesVenteService);
        expect(service).toBeTruthy();
    });
});
