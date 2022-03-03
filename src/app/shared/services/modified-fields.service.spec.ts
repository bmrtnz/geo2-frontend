import { TestBed } from "@angular/core/testing";

import { ModifiedFieldsService } from "./modified-fields.service";

describe("ModifiedFieldsService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: ModifiedFieldsService = TestBed.inject(
            ModifiedFieldsService,
        );
        expect(service).toBeTruthy();
    });
});
