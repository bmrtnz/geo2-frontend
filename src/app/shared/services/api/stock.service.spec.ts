import { TestBed } from "@angular/core/testing";

import { StockService } from "./stock.service";

describe("StockService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: StockService = TestBed.inject(StockService);
    expect(service).toBeTruthy();
  });
});
