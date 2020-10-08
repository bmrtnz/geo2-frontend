import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdresAccueilComponent } from './ordres-accueil.component';

describe('OrdresAccueilComponent', () => {
  let component: OrdresAccueilComponent;
  let fixture: ComponentFixture<OrdresAccueilComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdresAccueilComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdresAccueilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
