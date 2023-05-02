import { TestBed } from "@angular/core/testing";

import { DateManagementService } from "./date-management.service";

describe("DateManagementService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: DateManagementService = TestBed.inject(
      DateManagementService
    );
    expect(service).toBeTruthy();
  });
});
