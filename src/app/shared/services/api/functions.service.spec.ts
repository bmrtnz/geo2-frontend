import { TestBed } from "@angular/core/testing";

import { FunctionsService } from "./functions.service";

describe("FunctionsService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: FunctionsService = TestBed.inject(FunctionsService);
        expect(service).toBeTruthy();
    });
});
