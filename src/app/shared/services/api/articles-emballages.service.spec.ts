import { TestBed } from "@angular/core/testing";

import { ArticlesEmballagesService } from "./articles-emballages.service";

describe("ArticlesEmballagesService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: ArticlesEmballagesService = TestBed.inject(
            ArticlesEmballagesService,
        );
        expect(service).toBeTruthy();
    });
});
