import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrepotsListComponent } from './entrepots-list.component';

describe('EntrepotListComponent', () => {
  let component: EntrepotsListComponent;
  let fixture: ComponentFixture<EntrepotsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntrepotsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntrepotsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
