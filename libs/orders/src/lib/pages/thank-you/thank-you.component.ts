import { Component, OnInit } from '@angular/core';
import { CartService, Order, OrdersService } from '@spiceydev/orders';

@Component({
    selector: 'orders-thank-you-page',
    templateUrl: './thank-you.component.html',
    styles: []
})
export class ThankYouComponent implements OnInit {
    order: Order;
    constructor(
        private ordersService: OrdersService,
        private cartService: CartService
    ) {}

    ngOnInit() {
        const orderData = this.ordersService.getCachedOrderData();
        console.log(`orderData`, orderData);
        this.ordersService.createOrder(orderData).subscribe(() => {
            this.cartService.emptyCart();
            this.ordersService.removeCachedOrderData();
        });
    }
}
