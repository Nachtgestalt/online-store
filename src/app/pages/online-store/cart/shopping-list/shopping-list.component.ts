import {Component, Input, OnInit} from '@angular/core';
import {IProduct} from "../../../../models/product.interface";

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent implements OnInit {
  @Input()
  shoppingList: IProduct[]

  constructor() {
  }

  ngOnInit(): void {
  }

}
