import { TestBed } from "@angular/core/testing";

import { ArticlesService } from "./articles.service";

describe("ArticlesService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: ArticlesService = TestBed.inject(ArticlesService);
        expect(service).toBeTruthy();
    });
});
