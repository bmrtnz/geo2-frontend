import { TestBed } from "@angular/core/testing";

import { GroupesClientService } from "./groupes-vente.service";

describe("GroupesVenteService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: GroupesClientService =
            TestBed.inject(GroupesClientService);
        expect(service).toBeTruthy();
    });
});
