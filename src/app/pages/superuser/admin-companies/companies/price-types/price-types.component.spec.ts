import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PriceTypesComponent} from './price-types.component';

describe('PriceTypesComponent', () => {
  let component: PriceTypesComponent;
  let fixture: ComponentFixture<PriceTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PriceTypesComponent]
    })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
