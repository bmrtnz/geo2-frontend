import { TestBed } from "@angular/core/testing";

import { DefCodesPromoService } from "./def-codes-promo.service";

describe("DefCodesPromoService", () => {
  let service: DefCodesPromoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DefCodesPromoService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
