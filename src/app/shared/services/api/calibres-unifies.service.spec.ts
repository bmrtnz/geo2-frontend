import { TestBed } from "@angular/core/testing";

import { CalibresUnifiesService } from "./calibres-unifies.service";

describe("CalibresUnifiesService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: CalibresUnifiesService = TestBed.inject(
      CalibresUnifiesService
    );
    expect(service).toBeTruthy();
  });
});
