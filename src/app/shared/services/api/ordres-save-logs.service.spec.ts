import { TestBed } from "@angular/core/testing";

import { OrdresSaveLogsService } from "./ordres-save-logs.service";

describe("OrdresSaveLogsService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: OrdresSaveLogsService = TestBed.inject(
      OrdresSaveLogsService
    );
    expect(service).toBeTruthy();
  });
});
