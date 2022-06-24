import { TestBed } from "@angular/core/testing";

import { StockConsolideService } from "./stock-consolide.service";

describe("StockConsolideService", () => {
  let service: StockConsolideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockConsolideService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
