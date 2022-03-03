import { TestBed } from "@angular/core/testing";

import { EtiquettesUcService } from "./etiquettes-uc.service";

describe("EtiquettesUcService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: EtiquettesUcService =
            TestBed.inject(EtiquettesUcService);
        expect(service).toBeTruthy();
    });
});
