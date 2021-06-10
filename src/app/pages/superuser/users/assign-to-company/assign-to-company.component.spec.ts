import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AssignToCompanyComponent} from './assign-to-company.component';

describe('AssignToCompanyComponent', () => {
  let component: AssignToCompanyComponent;
  let fixture: ComponentFixture<AssignToCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssignToCompanyComponent]
    })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignToCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
