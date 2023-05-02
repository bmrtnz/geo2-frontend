import { TestBed } from "@angular/core/testing";

import { MoyenCommunicationService } from "./moyens-communication.service";

describe("MoyensCommunicationService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: MoyenCommunicationService = TestBed.inject(
      MoyenCommunicationService
    );
    expect(service).toBeTruthy();
  });
});
