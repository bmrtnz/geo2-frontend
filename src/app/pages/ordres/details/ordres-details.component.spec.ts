import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdresDetailsComponent } from './ordres-details.component';

describe('OrdresDetailsComponent', () => {
  let component: OrdresDetailsComponent;
  let fixture: ComponentFixture<OrdresDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdresDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdresDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
