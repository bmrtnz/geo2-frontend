import { TestBed } from "@angular/core/testing";

import { TypesClientService } from "./types-client.service";

describe("TypesClientService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: TypesClientService = TestBed.inject(TypesClientService);
    expect(service).toBeTruthy();
  });
});
