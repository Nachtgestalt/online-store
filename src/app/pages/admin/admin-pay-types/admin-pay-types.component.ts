import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-admin-pay-types',
  templateUrl: './admin-pay-types.component.html',
  styleUrls: ['./admin-pay-types.component.scss']
})
export class AdminPayTypesComponent implements OnInit {

  routeLinks: any[];

  constructor() {
    this.routeLinks = [
      {
        label: 'Administrar cuentas bancarias',
        link: './bank-accounts',
        index: 0
      }
    ];
  }

  ngOnInit(): void {
  }

}
