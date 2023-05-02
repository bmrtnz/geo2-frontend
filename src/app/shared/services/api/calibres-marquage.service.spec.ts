import { TestBed } from "@angular/core/testing";

import { CalibresMarquageService } from "./calibres-marquage.service";

describe("CalibresMarquageService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: CalibresMarquageService = TestBed.inject(
      CalibresMarquageService
    );
    expect(service).toBeTruthy();
  });
});
