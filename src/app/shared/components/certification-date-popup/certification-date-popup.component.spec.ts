import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificationDatePopupComponent } from './certification-date-popup.component';

describe('CertificationDatePopupComponent', () => {
  let component: CertificationDatePopupComponent;
  let fixture: ComponentFixture<CertificationDatePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CertificationDatePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificationDatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
