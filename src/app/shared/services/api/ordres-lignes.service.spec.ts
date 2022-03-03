import { TestBed } from "@angular/core/testing";

import { OrdreLignesService } from "./ordres-lignes.service";

describe("OrdresLignesService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: OrdreLignesService = TestBed.inject(OrdreLignesService);
        expect(service).toBeTruthy();
    });
});
