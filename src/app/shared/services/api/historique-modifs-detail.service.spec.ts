import { TestBed } from "@angular/core/testing";

import { HistoriqueModifsDetailService } from "./historique-modifs-detail.service";

describe("HistoriqueModifsDetailService", () => {
  let service: HistoriqueModifsDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoriqueModifsDetailService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
