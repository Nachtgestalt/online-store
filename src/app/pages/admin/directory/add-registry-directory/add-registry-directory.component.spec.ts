import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AddRegistryDirectoryComponent} from './add-registry-directory.component';

describe('AddRegistryDirectoryComponent', () => {
  let component: AddRegistryDirectoryComponent;
  let fixture: ComponentFixture<AddRegistryDirectoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddRegistryDirectoryComponent]
    })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRegistryDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
