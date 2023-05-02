import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { EditingAlertComponent } from "./editing-alert.component";

describe("EditingAlertComponent", () => {
  let component: EditingAlertComponent;
  let fixture: ComponentFixture<EditingAlertComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EditingAlertComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditingAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
