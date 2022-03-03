import { TestBed } from "@angular/core/testing";

import { CampagnesService } from "./campagnes.service";

describe("CampagnesService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: CampagnesService = TestBed.inject(CampagnesService);
        expect(service).toBeTruthy();
    });
});
