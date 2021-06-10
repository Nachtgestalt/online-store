import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-admin-users',
    templateUrl: './admin-users.component.html',
    styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
    routeLinks: any[];

    constructor() {
        this.routeLinks = [
            {
                label: 'Administrar usuarios',
                link: './users',
                index: 0
            }
        ];
    }

    ngOnInit(): void {
    }
}
