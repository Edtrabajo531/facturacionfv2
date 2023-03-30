import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing';
import { AppComponent } from './app.component';
import { NavSidebarComponent } from './components/shared/nav-sidebar/nav-sidebar.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { BillingComponent } from './components/billing/billing.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';
import { ProductsComponent } from './components/billing/products/products.component';
import { ClientsComponent } from './components/billing/clients/clients.component';
import { AddClientComponent } from './components/billing/add-client/add-client.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DecimalPipe, DatePipe } from '@angular/common';
import { NgxPrintModule } from 'ngx-print';
import { NgxPrintElementModule } from 'ngx-print-element';
import { LoaderComponent } from './components/shared/loader/loader.component';
import { AddMethodPaymentComponent } from './components/billing/add-method-payment/add-method-payment.component';
import { MethodsPaymentComponent } from './components/billing/methods-payment/methods-payment.component';


@NgModule({
  declarations: [
    AppComponent,
    NavSidebarComponent,
    FooterComponent,
    BillingComponent,
    ProductsComponent,
    ClientsComponent,
    AddClientComponent,
    LoaderComponent,
    AddMethodPaymentComponent,
    MethodsPaymentComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({ closeButton: true, autoDismiss: true, enableHtml: true, timeOut: 2000, positionClass: 'toast-bottom-center' }),
    HttpClientModule,
    DataTablesModule,
    NgxPrintModule,
    NgxPrintElementModule

  ],
  providers: [DecimalPipe,DatePipe],
  bootstrap: [AppComponent]
})

export class AppModule { }
