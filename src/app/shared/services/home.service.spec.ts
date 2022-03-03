import { TestBed } from "@angular/core/testing";

import { NavHomeService } from "./home.service";

describe("HomeService", () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            providers: [NavHomeService],
        }),
    );

    it("should be created", () => {
        const service: NavHomeService = TestBed.inject(NavHomeService);
        expect(service).toBeTruthy();
    });
});
