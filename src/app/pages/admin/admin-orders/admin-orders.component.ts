import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {
  routeLinks: any[];
  activeLinkIndex = -1;

  constructor() {
    this.routeLinks = [
      {
        label: 'Administrar pedidos',
        link: './admin',
        index: 0
      },
      {
        label: 'Estados de Pedidos',
        link: './order-status',
        index: 0
      }
    ];
  }

  ngOnInit(): void {
  }

}
