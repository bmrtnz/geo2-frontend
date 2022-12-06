import { TestBed } from "@angular/core/testing";

import { PlanningDepartMaritimeService } from "./planning-depart-maritime.service";

describe("PlanningDepartMaritimeService", () => {
  let service: PlanningDepartMaritimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanningDepartMaritimeService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
