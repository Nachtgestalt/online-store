import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent implements OnInit {
  links: any[] = [
    {
      label: 'Administrar pedidos',
      url: './orders',
    },
    {
      label: 'Administrar productos',
      url: './products',
    },
    {
      label: 'Opciones de configuración',
      url: './config',
    }
  ];
  activeLink = this.links[0];

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.activeLink = this.links.indexOf(this.links.find(tab => tab.link === '.' + this.router.url));
    });
  }

}
