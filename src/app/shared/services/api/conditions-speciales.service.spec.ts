import { TestBed } from "@angular/core/testing";

import { ConditionsSpecialesService } from "./conditions-speciales.service";

describe("ConditionsSpecialesService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: ConditionsSpecialesService = TestBed.inject(
            ConditionsSpecialesService,
        );
        expect(service).toBeTruthy();
    });
});
