import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AG_GRID_LOCALE} from "../../../../shared/constants";
import {GridApi, GridOptions} from "ag-grid-community";
import {SetupService} from "../../../../services/setup.service";
import {UserService} from "../../../../services/user.service";
import {IAppState, selectAuthState} from "../../../../store/state/app.state";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {map, switchMap, take} from "rxjs/operators";
import {SetupUserService} from "../../../../services/setup-user.service";
import {MatSelectionList} from "@angular/material/list";
import {MatStepper} from "@angular/material/stepper";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-assign-to-company',
    templateUrl: './assign-to-company.component.html',
    styleUrls: ['./assign-to-company.component.scss']
})
export class AssignToCompanyComponent implements OnInit {
    @ViewChild('list') list: MatSelectionList;
    @ViewChild('stepper') stepper: MatStepper;
    editableStep = true;
    selectedUsers = [];
    adminUsers = [];
    userFormControl: FormControl = new FormControl(null, Validators.required);
    setupFormGroup: FormGroup;

    getAuthState: Observable<any>;
    localeText = AG_GRID_LOCALE;
    public gridOptions: GridOptions;
    public gridUserOptions: GridOptions;
    private gridUserApi: GridApi;
    private gridColumUserApi;
    private gridApi: GridApi;
    private gridColumnApi;

    constructor(private setupService: SetupService,
                private setupUserService: SetupUserService,
                private userService: UserService,
                private store: Store<IAppState>,
                private matSnackBar: MatSnackBar) {
        this.getAuthState = this.store.select(selectAuthState);
        this.gridOptions = <GridOptions>{
            defaultColDef: {
                resizable: true,
                flex: 1,
                filter: true,
                floatingFilter: true,
            },
            columnDefs: this.createColumnDefs(),
            getRowNodeId: function (data) {
                return data.id;
            },
            rowBuffer: 0,
            rowSelection: 'single',
            cacheOverflowSize: 2,
            maxConcurrentDatasourceRequests: 1,
            infiniteInitialRowCount: 50,
            cacheBlockSize: 100,
            maxBlocksInCache: 2,
            onGridReady: (params) => {
                this.gridApi = params.api;
                this.gridColumnApi = params.columnApi;
                this.setupService.fetchSetups().subscribe((rowData: Array<any>) => {
                    if (this.gridOptions.api) {
                        this.gridOptions.api.setRowData(rowData);
                    }
                })
            },
            // onFirstDataRendered(params) {
            //     params.api.sizeColumnsToFit();
            // },
            onSelectionChanged: (event) => {
                if (event.api.getSelectedRows().length > 0) {
                    this.setupFormGroup.get('setupId').patchValue(
                        event.api.getSelectedRows()[0].id
                    );
                } else {
                    this.setupFormGroup.get('setupId').patchValue(null)
                }
            }
        }

        this.gridUserOptions = <GridOptions>{
            defaultColDef: {
                resizable: true,
                flex: 1,
                filter: true,
                floatingFilter: true,
            },
            columnDefs: this.createUserColumnDefs(),
            getRowNodeId: function (data) {
                return data.id;
            },
            rowBuffer: 0,
            rowSelection: 'multiple',
            cacheOverflowSize: 2,
            maxConcurrentDatasourceRequests: 1,
            infiniteInitialRowCount: 50,
            cacheBlockSize: 100,
            maxBlocksInCache: 2,
            onGridReady: (params) => {
                this.gridUserApi = params.api;
                this.gridColumUserApi = params.columnApi;
            },
            // onFirstDataRendered(params) {
            //     params.api.sizeColumnsToFit();
            // },
            onSelectionChanged: (event) => {
                // console.log(event.api.getSelectedRows());
                if (event.api.getSelectedRows().length > 0) {
                    this.selectedUsers = event.api.getSelectedRows();
                    this.userFormControl.patchValue(true)
                } else {
                    this.selectedUsers = [];
                    this.userFormControl.patchValue(null)
                }
            }
        }
    }

    ngOnInit(): void {
        this.createFormGroup();
    }

    createFormGroup() {
        this.setupFormGroup = new FormGroup({
            'setupId': new FormControl(null, Validators.required)
        });
    }

    createColumnDefs() {
        return [
            {
                headerName: 'Cuenta',
                field: 'companyAccount',
                filter: true,
                width: 90,
                checkboxSelection: true,
            },
            {headerName: 'Bucket', field: 'bucketToImages', width: 60},
        ]
    }

    createUserColumnDefs() {
        return [
            {
                headerName: 'Email',
                field: 'email',
                filter: true,
                width: 90,
                checkboxSelection: true,
            },
            {headerName: 'Nombre', field: 'firstname', width: 60},
        ]
    }

    assignUsersToCompany() {
        console.log(this.list);
        let adminUsers = this.list.selectedOptions.selected;
        console.log(adminUsers)
        let userRequest = this.getAuthState.pipe(
            map(({user}) => user.id),
            switchMap(userId => {
                let setupUsers = [];
                this.selectedUsers.forEach(selectedUser => {
                    let setup = {
                        usersId: selectedUser.id,
                        usersIdCreator: userId,
                        setupId: this.setupFormGroup.get('setupId').value,
                        isRoot: 0
                    }
                    if (this.adminUsers.length > 0) {
                        this.adminUsers.forEach(user => {
                            if (user.id === setup.usersId) {
                                setup.isRoot = 1
                            }
                        })
                    }
                    setupUsers.push(setup);
                })
                return this.setupUserService.saveSetupUser(setupUsers);
            })
        )

        userRequest.subscribe(() => {
            this.stepper.next();
            this.editableStep = false;
        })
    }

    loadUsers() {
        let setupId = this.setupFormGroup.get('setupId').value;
        if (!setupId) {
            return;
        }
        this.userService.fetchAllUsers()
            .pipe(
                map(users => {
                    return users.filter(user => {
                        if (user.osSetupUsers.length > 0) {
                            let setupUser = user.osSetupUsers.filter(setupUser => setupUser.setupId === setupId);
                            return setupUser.length <= 0;
                        } else {
                            return true
                        }
                    });
                }),
            )
            .subscribe((rowData: Array<any>) => {
                console.log(rowData);
                if (this.gridUserOptions.api) {
                    this.gridUserOptions.api.setRowData(rowData);
                }
            })
    }

    resetStepper() {
        this.createFormGroup();
        this.userFormControl = new FormControl(null, Validators.required);
        this.selectedUsers = [];
        this.adminUsers = [];
        this.stepper.reset();
        this.editableStep = true;
        this.setupService.fetchSetups().pipe(take(1)).subscribe((rowData: Array<any>) => {
            if (this.gridOptions.api) {
                this.gridOptions.api.setRowData(rowData);
            }
        })
    }
}
