import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdresIndicateursComponent } from './ordres-indicateurs.component';

describe('OrdresIndicateursComponent', () => {
  let component: OrdresIndicateursComponent;
  let fixture: ComponentFixture<OrdresIndicateursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdresIndicateursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdresIndicateursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
