import {Component, OnInit} from '@angular/core';
import {AG_GRID_LOCALE} from "../../../../shared/constants";
import {GridApi, GridOptions} from "ag-grid-community";
import {UserService} from "../../../../services/user.service";
import {MatDialog} from "@angular/material/dialog";
import {AssignPrivilegesComponent} from "../assign-privileges/assign-privileges.component";

@Component({
    selector: 'app-admin-setup-users',
    templateUrl: './admin-setup-users.component.html',
    styleUrls: ['./admin-setup-users.component.scss']
})
export class AdminSetupUsersComponent implements OnInit {

    localeText = AG_GRID_LOCALE;
    public gridUserOptions: GridOptions;
    selectedUsers = [];
    private gridUserApi: GridApi;
    private gridColumUserApi;

    constructor(private userService: UserService,
                public dialog: MatDialog) {
        this.gridUserOptions = <GridOptions>{
            defaultColDef: {
                resizable: true,
                flex: 1
            },
            columnDefs: this.createUserColumnDefs(),
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
                this.gridUserApi = params.api;
                this.gridColumUserApi = params.columnApi;
                this.userService.fetchAllUsers()
                    .subscribe((rowData: any[]) => {
                        this.gridUserOptions.api.setRowData(rowData);
                    });
            },
            // onFirstDataRendered(params) {
            //     params.api.sizeColumnsToFit();
            // },
            onSelectionChanged: (event) => {
                if (event.api.getSelectedRows().length > 0) {
                    this.selectedUsers = event.api.getSelectedRows();
                } else {
                    this.selectedUsers = []
                }
            }
        }
    }

    ngOnInit(): void {
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

    openModal(edit) {
        const dialogRef = this.dialog.open(AssignPrivilegesComponent, {
            width: '80vw',
            height: '600px',
            data: {
                edit,
                selection: this.selectedUsers[0]
            }
        });
    }
}
