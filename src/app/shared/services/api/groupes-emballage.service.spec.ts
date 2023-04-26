import { TestBed } from "@angular/core/testing";

import { GroupesEmballageService } from "./groupes-emballage.service";

describe("GroupesEmballageService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: GroupesEmballageService = TestBed.inject(
      GroupesEmballageService
    );
    expect(service).toBeTruthy();
  });
});
