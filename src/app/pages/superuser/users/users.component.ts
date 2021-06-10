import {Component, OnInit} from '@angular/core';
import {SetupService} from "../../../services/setup.service";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
    routeLinks: any[];
    activeLinkIndex = -1;

    constructor(private setupService: SetupService,
                public dialog: MatDialog,
                private router: Router) {
        this.routeLinks = [
            {
                label: 'Agregar usuario a empresa',
                link: './assign-to-company',
                index: 0
            }
            // {
            //   label: 'Otorgar privilegios a usuario',
            //   link: './admin',
            //   index: 1
            // }
        ];
    }

    ngOnInit(): void {
        this.router.events.subscribe((res) => {
            this.activeLinkIndex = this.routeLinks.indexOf(this.routeLinks.find(tab => tab.link === '.' + this.router.url));
        });
    }
}
