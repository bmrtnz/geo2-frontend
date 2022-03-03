import { TestBed } from "@angular/core/testing";

import { VarietesService } from "./varietes.service";

describe("VarietesService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: VarietesService = TestBed.inject(VarietesService);
        expect(service).toBeTruthy();
    });
});
