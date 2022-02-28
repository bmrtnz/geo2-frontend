import { TestBed } from "@angular/core/testing";

import { MarquesService } from "./marques.service";

describe("MarquesService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: MarquesService = TestBed.inject(MarquesService);
        expect(service).toBeTruthy();
    });
});
