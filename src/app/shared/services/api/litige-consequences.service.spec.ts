import { TestBed } from "@angular/core/testing";

import { LitigeConsequencesService } from "./litige-consequences.service";

describe("LitigeConsequencesService", () => {
  let service: LitigeConsequencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LitigeConsequencesService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
