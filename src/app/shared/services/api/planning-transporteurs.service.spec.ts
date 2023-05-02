import { TestBed } from "@angular/core/testing";

import { PlanningTransporteursService } from "./planning-transporteurs.service";

describe("PlanningTransporteursService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: PlanningTransporteursService = TestBed.inject(
      PlanningTransporteursService
    );
    expect(service).toBeTruthy();
  });
});
