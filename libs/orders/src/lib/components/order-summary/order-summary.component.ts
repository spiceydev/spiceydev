import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';

@Component({
    selector: 'orders-order-summary',
    templateUrl: './order-summary.component.html',
    styles: []
})
export class OrderSummaryComponent implements OnInit, OnDestroy {
    endSubs$: Subject<any> = new Subject();
    totalPrice: number;
    isCheckout = false;
    constructor(
        private router: Router,
        private cartService: CartService,
        private ordersService: OrdersService
    ) {
        this.router.url.includes('checkout')
            ? (this.isCheckout = true)
            : (this.isCheckout = false);
    }

    ngOnInit(): void {
        this._getOrderSummary();
    }

    ngOnDestroy(): void {
        this.endSubs$.next();
        this.endSubs$.complete();
    }

    _getOrderSummary() {
        this.cartService.cart$
            .pipe(takeUntil(this.endSubs$))
            .subscribe((cart) => {
                this.totalPrice = 0;
                if (cart) {
                    cart.items.map((item) => {
                        this.ordersService
                            .getProduct(item.productId)
                            .pipe(takeUntil(this.endSubs$))
                            .subscribe((product) => {
                                if (product.discount === 0) {
                                    this.totalPrice +=
                                        product.price * item.quantity;
                                } else {
                                    this.totalPrice +=
                                        (product.price -
                                            product.price *
                                                (product.discount / 100)) *
                                        item.quantity;
                                }
                            });
                    });
                }
            });
    }

    navigateToCheckout() {
        this.router.navigate(['/checkout']);
    }
}
