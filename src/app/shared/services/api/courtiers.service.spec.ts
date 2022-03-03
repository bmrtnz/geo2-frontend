import { TestBed } from "@angular/core/testing";

import { CourtierService } from "./courtiers.service";

describe("CourtiersService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: CourtierService = TestBed.inject(CourtierService);
        expect(service).toBeTruthy();
    });
});
