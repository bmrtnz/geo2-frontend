import { TestBed } from "@angular/core/testing";

import { ModificationsService } from "./modification.service";

describe("ModificationService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: ModificationsService = TestBed.inject(ModificationsService);
    expect(service).toBeTruthy();
  });
});
