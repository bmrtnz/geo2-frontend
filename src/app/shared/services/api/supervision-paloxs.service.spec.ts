import { TestBed } from "@angular/core/testing";

import { SupervisionPaloxsService } from "./supervision-paloxs.service";

describe("SupervisionPaloxsService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: SupervisionPaloxsService = TestBed.inject(
            SupervisionPaloxsService,
        );
        expect(service).toBeTruthy();
    });
});
