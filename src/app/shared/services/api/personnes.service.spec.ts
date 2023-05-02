import { TestBed } from "@angular/core/testing";

import { PersonnesService } from "./personnes.service";

describe("PersonnesService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: PersonnesService = TestBed.inject(PersonnesService);
    expect(service).toBeTruthy();
  });
});
