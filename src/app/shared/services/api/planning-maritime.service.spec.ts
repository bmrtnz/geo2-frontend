import { TestBed } from "@angular/core/testing";

import { PlanningMaritimeService } from "./planning-maritime.service";

describe("PlanningDepartMaritimeService", () => {
  let service: PlanningMaritimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanningMaritimeService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
