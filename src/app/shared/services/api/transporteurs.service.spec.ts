import { TestBed } from "@angular/core/testing";

import { TransporteursService } from "./transporteurs.service";

describe("TransporteursService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: TransporteursService =
            TestBed.inject(TransporteursService);
        expect(service).toBeTruthy();
    });
});
