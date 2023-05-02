import { TestBed } from "@angular/core/testing";

import { BureauxAchatService } from "./bureaux-achat.service";

describe("BureauxAchatService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: BureauxAchatService = TestBed.inject(BureauxAchatService);
    expect(service).toBeTruthy();
  });
});
