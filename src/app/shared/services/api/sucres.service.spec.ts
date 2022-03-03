import { TestBed } from "@angular/core/testing";

import { SucresService } from "./sucres.service";

describe("SucresService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: SucresService = TestBed.inject(SucresService);
        expect(service).toBeTruthy();
    });
});
