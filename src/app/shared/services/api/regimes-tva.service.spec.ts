import { TestBed } from "@angular/core/testing";

import { RegimesTvaService } from "./regimes-tva.service";

describe("RegimesTvaService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: RegimesTvaService = TestBed.inject(RegimesTvaService);
        expect(service).toBeTruthy();
    });
});
