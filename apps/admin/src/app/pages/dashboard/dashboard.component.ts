import { Component, OnDestroy, OnInit } from '@angular/core';
import { OrdersService } from '@spiceydev/orders';
import { ProductsService } from '@spiceydev/products';
import { UsersService } from '@spiceydev/users';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'admin-dashboard',
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
    statistics = [];
    endSubs$: Subject<any> = new Subject();

    constructor(
        private userService: UsersService,
        private productService: ProductsService,
        private ordersService: OrdersService
    ) {}

    ngOnInit(): void {
        combineLatest([
            this.ordersService.getOrdersCount(),
            this.productService.getProductsCount(),
            this.userService.getUsersCount(),
            this.ordersService.getTotalSales()
        ])
            .pipe(takeUntil(this.endSubs$))
            .subscribe((values) => {
                this.statistics = values;
            });
    }

    ngOnDestroy() {
        this.endSubs$.next();
        this.endSubs$.complete();
    }
}
