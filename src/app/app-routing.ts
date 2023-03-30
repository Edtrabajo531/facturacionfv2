import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingComponent } from './components/billing/billing.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'desc' },
  { path: ':caja_id', pathMatch: 'full', component: BillingComponent },
  { path: 'desc', pathMatch: 'full', component: BillingComponent },

  // { path: 'facturacion/', pathMatch: 'full', component: BillingComponent },
  //{ path: 'detalles-publicacion/:slug', pathMatch: 'full', component: DetailsComponent },
  // {
  //   path: 'panel',
  //   component: PanelComponent,
  //   children: [
  //     { path: 'saldo', component: SaldoComponent },
  //   ],
  // },
 
  //{ path: 'admin', pathMatch: 'full', redirectTo: 'administrar/planes' },
 //{ path: '**', pathMatch: 'full', redirectTo: 'facturacion' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      initialNavigation: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
