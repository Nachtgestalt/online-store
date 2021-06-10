import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {switchMap} from "rxjs/operators";
import {throwError} from "rxjs";
import {OrderService} from "../../../services/order.service";

@Component({
    selector: 'app-confirm-order',
    templateUrl: './confirm-order.component.html',
    styleUrls: ['./confirm-order.component.scss']
})
export class ConfirmOrderComponent implements OnInit {
    newOrder: string;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private orderService: OrderService) {
    }

    ngOnInit(): void {
        this.newOrder = this.route.snapshot.queryParamMap.get('newOrder');

        this.route.params.pipe(
            switchMap((params: Params) => {
                if (params['orderId']) {
                    return this.orderService.fetchOrder(params['orderId'])
                } else {
                    return throwError('error');
                }
            })
        ).subscribe(order => {
                if (this.newOrder === 'true') {
                    return;
                }
                this.router.navigate(['../../member/admin/orders'], {
                    relativeTo: this.route
                })
            },
            error => this.router.navigate(['./'], {
                relativeTo: this.route
            }));
    }

    goToHome() {
        this.router.navigate(['../../'], {relativeTo: this.route});
    }

    goToOrders() {
        this.router.navigate(['../../dashboarduser'], {relativeTo: this.route});
    }
}
