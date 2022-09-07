import { TestBed } from "@angular/core/testing";

import { FluxArService } from "./flux-ar.service";

describe("FluxArService", () => {
  let service: FluxArService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FluxArService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
