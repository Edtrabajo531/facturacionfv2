import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../AppConfig';


@Injectable({
  providedIn: 'root'
})
export class BillingService {

  ENDPOINT = AppConfig.ENDPOINT;
  constructor(
    private http:HttpClient
  ) { }

  dataPrintInvoice(nro_factura:string){
    return this.http.post(this.ENDPOINT + "data-print-invoice", {nro_factura:nro_factura});
  }

  clients(){
    return this.http.post(this.ENDPOINT + "clientes", "");
  }

  products(caja_id:any){
    return this.http.get(this.ENDPOINT + "productos?caja_id="+caja_id);
  }

  searchClient(type_ident:any,ident:any){
    return this.http.post(this.ENDPOINT + "search-client", {type_ident:type_ident,ident:ident});
  }

  searchProductCode(code:number,caja_id:any){
    return this.http.post(this.ENDPOINT + "search-product-code", {code:code,caja_id:caja_id});
  }

  storeUpdateClient(values:any){
    return this.http.post( this.ENDPOINT + "store-update-client", values );
  }

  pay(id_cliente:any,productos:any,total:any,observaciones:any,cancel_payment:any,formasdepago:any,tipo_documento:any,caja_id:any,totaldescuento:any,descuentoadd:number){
    return this.http.post( this.ENDPOINT + "pay",{id_cliente:id_cliente,productos:productos,total:total,observaciones:observaciones,cancel_payment:cancel_payment,formasdepago:formasdepago,tipo_documento:tipo_documento,caja_id:caja_id,totaldescuento:totaldescuento,descuentoadd:descuentoadd} );
  }

  validateCashStatus(id_caja:number){
    return this.http.post( this.ENDPOINT + "validate-cash-status", {id:id_caja} );
  }

}
