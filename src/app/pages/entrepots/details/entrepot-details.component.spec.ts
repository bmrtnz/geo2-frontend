import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrepotDetailsComponent } from './entrepot-details.component';

describe('EntrepotDetailsComponent', () => {
  let component: EntrepotDetailsComponent;
  let fixture: ComponentFixture<EntrepotDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntrepotDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntrepotDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
