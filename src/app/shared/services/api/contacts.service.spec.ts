import { TestBed } from "@angular/core/testing";

import { ContactsService } from "./contacts.service";

describe("ContactsService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: ContactsService = TestBed.inject(ContactsService);
    expect(service).toBeTruthy();
  });
});
