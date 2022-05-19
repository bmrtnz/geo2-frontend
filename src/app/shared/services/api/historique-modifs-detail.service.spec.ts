import { TestBed } from "@angular/core/testing";

import { HistoriqueModificationsDetailService } from "./historique-modifs-detail.service";

describe("HistoriqueModificationsDetailService", () => {
  let service: HistoriqueModificationsDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoriqueModificationsDetailService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
