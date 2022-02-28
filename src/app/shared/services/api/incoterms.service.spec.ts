import { TestBed } from "@angular/core/testing";

import { IncotermsService } from "./incoterms.service";

describe("IncotermsService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: IncotermsService = TestBed.inject(IncotermsService);
        expect(service).toBeTruthy();
    });
});
