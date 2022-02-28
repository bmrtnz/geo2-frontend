import { TestBed } from "@angular/core/testing";

import { GridsConfigsService } from "./grids-configs.service";

describe("GridsConfigsService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: GridsConfigsService =
            TestBed.inject(GridsConfigsService);
        expect(service).toBeTruthy();
    });
});
