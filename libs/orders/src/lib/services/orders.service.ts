import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Order } from '../models/order';
import { environment } from '@env/environment';
import { OrderItem } from '@spiceydev/orders';
import { StripeService } from 'ngx-stripe';

const ORDER_DATA_TOKEN = 'orderData';
@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    apiURLOrders = environment.apiURL + '/orders';
    apiURLProducts = environment.apiURL + '/products';

    constructor(
        private http: HttpClient,
        private stripeService: StripeService
    ) {}

    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.apiURLOrders);
    }

    getOrder(orderId: string): Observable<Order> {
        return this.http.get<Order>(`${this.apiURLOrders}/${orderId}`);
    }

    createOrder(order: Order): Observable<Order> {
        return this.http.post<Order>(this.apiURLOrders, order);
    }

    updateOrder(
        orderStatus: { status: string },
        orderId: string
    ): Observable<Order> {
        return this.http.put<Order>(
            `${this.apiURLOrders}/${orderId}`,
            orderStatus
        );
    }

    deleteOrder(orderId: string): Observable<any> {
        return this.http.delete<any>(`${this.apiURLOrders}/${orderId}`);
    }

    getOrdersCount(): Observable<number> {
        return this.http
            .get<number>(`${this.apiURLOrders}/get/count`)
            .pipe(map((objectValue: any) => objectValue.orderCount));
    }

    getTotalSales(): Observable<number> {
        return this.http
            .get<number>(`${this.apiURLOrders}/get/totalsales`)
            .pipe(map((objectValue: any) => objectValue.totalsales));
    }

    getProduct(productId: string): Observable<any> {
        return this.http.get<any>(`${this.apiURLProducts}/${productId}`);
    }

    createCheckoutSession(orderItems: OrderItem[]) {
        return this.http
            .post(`${this.apiURLOrders}/create-checkout-session`, orderItems)
            .pipe(
                switchMap((session: { id: string }) => {
                    return this.stripeService.redirectToCheckout({
                        sessionId: session.id
                    });
                })
            );
    }

    cacheOrderData(order: Order) {
        localStorage.setItem(ORDER_DATA_TOKEN, JSON.stringify(order));
    }

    getCachedOrderData() {
        return JSON.parse(localStorage.getItem(ORDER_DATA_TOKEN));
    }

    removeCachedOrderData() {
        localStorage.removeItem(ORDER_DATA_TOKEN);
    }
}
