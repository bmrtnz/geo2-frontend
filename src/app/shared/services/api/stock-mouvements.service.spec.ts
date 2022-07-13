import { TestBed } from "@angular/core/testing";

import { StockMouvementsService } from "./stock-mouvements.service";

describe("StockMouvementsService", () => {
  let service: StockMouvementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockMouvementsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
