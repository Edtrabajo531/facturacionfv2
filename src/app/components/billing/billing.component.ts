import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BillingService } from '../../services/billing.service';
import { ValidatorsService } from '../../services/validators.service';
import { NgxPrintElementService } from 'ngx-print-element';
import { DecimalPipe, DatePipe } from '@angular/common';
import { PaymentMethod } from '../../models/paymentMethod.model';
import { ActivatedRoute } from '@angular/router';
import { MethodsPaymentComponent } from './methods-payment/methods-payment.component';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
})
export class BillingComponent implements OnInit {
  @ViewChild(MethodsPaymentComponent) childMP: MethodsPaymentComponent;
  public config = {
    printMode: 'template-popup',
    popupProperties:
      'toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=0,fullscreen=yes',
    pageTitle: 'Hello World',
    templateString:
      "<header>I'm part of the template header</header>{{printBody}}<footer>I'm part of the template footer</footer>",
    stylesheets: [
      {
        rel: 'stylesheet',
        href: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
      },
    ],
    styles: ['.table { color: red; }', '.table td { color: green; }'],
  };

  @ViewChild('modalPay') modalPay: ElementRef;
  @ViewChild('modalWarning') modalWarning: ElementRef;
  @ViewChild('modalMethodPayment') modalMethodPayment: ElementRef;
  @ViewChild('modalPrint') modalPrint: ElementRef;
  @ViewChild('modalClients') modalClients: ElementRef;
  @ViewChild('modalClient') modalClient: ElementRef;
  @ViewChild('modalProducts') modalProducts: ElementRef;
  @ViewChild('tipe_ident') tipe_ident: ElementRef;
  @ViewChild('ident') ident: ElementRef;
  @ViewChild('observaciones') observaciones: ElementRef;
  @ViewChild('tipo_documento') tipo_documento: ElementRef;
  @ViewChild('changeDInput') changeDInput: ElementRef;
  @ViewChild('inputCode') inputCode: ElementRef;
  // data moda pay
  pagar: any = 0;
  // ---
  totalPayment: any = 0;
  pagarm: any = false;
  received: any = 0;
  lockscards = false;
  loading = true;
  identNotExist = false;
  change_ident = false;
  form: FormGroup;
  tipe_ident_error: string;
  ident_error: string;
  total: any = 0;
  totalconniva: number = 0;
  totalsinniva: number = 0;
  totaldescuento: number = 0;
  products: any = [];
  payments: any = [];
  tableClients = false;
  formClient = false;
  client: any;
  timeout: any;
  searchingClient = false;
  nro_factura: string;
  invoicePrint: any;
  invoiceDetails: any;
  searchingProduct = false;
  formProducts = false;
  formMethodPayment = false;
  subtotaliva12 = 0;
  subtotaliva0 = 0;
  cancelPayment: any = 'contado';
  totaliva: any = 0;
  cashPayments: any = [];
  cashPayment_id = 0;
  creditPayments: any = [];
  editPaymentMethod: any = {};
  wayPayment: any;
  textModalWarning: string;
  maxAmount: any;
  seleccionados: any;
  caja_id: any;
  tableProducts = true;
  preciosG: any = [];
  time: any;
  applyDiscountG = false;
  resetDiscount = false;
  type_discount_g = 'Dollar';
  descontarPorcentaje: any = 0;
  descontar: any = 0;
  type_priceG: any = 'original';
  constructor(
    private modalS: NgbModal,
    private billingS: BillingService,
    private formBuilder: FormBuilder,
    private validatorsS: ValidatorsService,
    private toastrS: ToastrService,
    public print: NgxPrintElementService,
    public DecimalP: DecimalPipe,
    public datePipe: DatePipe,
    public activatedR: ActivatedRoute
  ) {}

  ngOnInit(): void {
    let caja = this.activatedR.snapshot.paramMap.get('caja_id');
    this.caja_id = caja;
    // if (caja == "caja-1") {
    //   this.caja_id = 1;
    // } else if (caja == "caja-2") {
    //   this.caja_id = 10;
    // } else {

    //   window.location.href = 'http://localhost/all/';

    //   // window.location.href = 'https://csempaques.actfacturas.com';
    //   return;
    // }
    this.validateCajaEstatus();
  }

  validateCajaEstatus() {
    this.billingS.validateCashStatus(this.caja_id).subscribe((data: any) => {
      console.log(data);
      console.log(data);
      console.log(data);
      console.log(data);
      console.log(data);


      if (data.status == 'no existe') {
        setTimeout(() => {
          this.openModalWarning('La caja no existe.');
        }, 500);

        this.loading = false;
        this.lockscards = true;
      } else if (data.status != 'ok') {
        this.loading = false;
        this.lockscards = true;
        setTimeout(() => {
          this.openModalWarning(
            'La caja no se encuentra abierta en este momento.'
          );
        }, 500);

        return;
      }

      this.invoiceCalculations();

      this.formR();
      this.resetClient();
    });
  }

  reloadTable() {
    this.tableProducts = false;
    setTimeout(() => {
      this.tableProducts = true;
    }, 100);
  }
  new() {
    window.location.reload();
  }
  formR() {
    this.form = this.formBuilder.group(
      {
        id_cliente: [this.client?.id_cliente],
        tipo_ident_cliente: [
          this.client?.tipo_ident_cliente,
          [Validators.required],
        ],
        ident_cliente: [
          this.client?.ident_cliente,
          [Validators.required, this.validatorsS.number],
        ],

        change_ident: [0],
      },
      { validator: this.validateTypeDoc }
    );

    this.form.controls['id_cliente'].setValue(1);

    console.log(this.form.controls['id_cliente'].value);
  }

  validate(name: string) {
    if (this.form) {
      return this.validatorsS.sow_message(this.form, name);
    }
    return { valid: null, error: null };
  }

  validateTypeDoc(frm: FormGroup) {
    if (
      frm.controls['change_ident'].value == 1 &&
      frm.controls['tipo_ident_cliente'].value?.length != 0 &&
      frm.controls['tipo_ident_cliente'].value == 'R' &&
      frm.controls['ident_cliente'].value?.length != 13 &&
      frm.controls['ident_cliente'].value?.length != 0
    ) {
      return { ident_ruc: true };
    } else if (
      frm.controls['change_ident'].value == 1 &&
      frm.controls['tipo_ident_cliente'].value?.length != 0 &&
      frm.controls['tipo_ident_cliente'].value == 'C' &&
      frm.controls['ident_cliente'].value?.length != 10 &&
      frm.controls['ident_cliente'].value?.length != 0
    ) {
      return { ident_c: true };
    } else if (
      frm.controls['change_ident'].value == 1 &&
      frm.controls['tipo_ident_cliente'].value?.length != 0 &&
      frm.controls['tipo_ident_cliente'].value == 'P' &&
      frm.controls['ident_cliente']?.value.length != 9 &&
      frm.controls['ident_cliente'].value?.length != 0
    ) {
      return { ident_p: true };
    } else {
      return;
    }
  }

  receivePreciosToChild(precios: any) {
    this.preciosG = precios;
  }

  receiveToChild(message: any) {
    console.log(message);

    if (message == 'hideModal') {
      this.hideModals();
    } else if (message == 'hideLoader') {
      this.loading = false;
    }
  }

  receivePayments(payments: any) {
    console.log(payments);
    this.payments = payments;
  }

  receiveDataToChild(data: any) {
    console.log(data);

    this.client = data;
    this.form.controls['id_cliente'].setValue(data.id_cliente);
    this.form.controls['tipo_ident_cliente'].setValue(data.tipo_ident_cliente);
    this.form.controls['ident_cliente'].setValue(data.ident_cliente);
    this.hideModals();
  }

  receiveProductToChild(data: any) {
    this.addProduct(data);
  }

  searchClient() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.onChangeIdent();
      this.searchClientIdent();
      clearTimeout(this.timeout);
    }, 500);
  }

  enterProductCode(event: any) {
    this.searchProductCode(event.target.value);
    event.target.value = '';
  }

  clickProductCode() {
    let code = this.inputCode.nativeElement.value;
    this.searchProductCode(code);
    this.inputCode.nativeElement.value = '';
  }

  searchProductCode(code: number) {
    this.searchingProduct = true;
    this.billingS
      .searchProductCode(code, this.caja_id)
      .subscribe((data: any) => {
        if (data.result == 'not exist') {
          this.toastrS.warning('Producto no encontrado.');
          this.searchingProduct = false;
        } else {
          this.addProduct(data.data);
          this.searchingProduct = false;
        }
      });
  }

  onChangeIdent() {
    this.form.controls['change_ident'].setValue(1);
    this.identNotExist = false;
  }

  searchClientIdent() {
    if (
      this.form.controls['change_ident'].value == 1 &&
      this.form.controls['tipo_ident_cliente'].value?.length != 0 &&
      this.form.controls['tipo_ident_cliente'].value == 'R' &&
      this.form.controls['ident_cliente'].value?.length != 13 &&
      this.form.controls['ident_cliente'].value?.length != 0
    ) {
      return;
    } else if (
      this.form.controls['change_ident'].value == 1 &&
      this.form.controls['tipo_ident_cliente'].value?.length != 0 &&
      this.form.controls['tipo_ident_cliente'].value == 'C' &&
      this.form.controls['ident_cliente'].value?.length != 10 &&
      this.form.controls['ident_cliente'].value?.length != 0
    ) {
      return;
    } else if (
      this.form.controls['change_ident'].value == 1 &&
      this.form.controls['tipo_ident_cliente'].value?.length != 0 &&
      this.form.controls['tipo_ident_cliente'].value == 'P' &&
      this.form.controls['ident_cliente'].value?.length != 9 &&
      this.form.controls['ident_cliente'].value?.length != 0
    ) {
      return;
    }

    let type_ident = this.tipe_ident.nativeElement.value;
    let ident = this.ident.nativeElement.value;

    if (type_ident?.length != 0 && ident?.length) {
      this.searchingClient = true;
      this.billingS.searchClient(type_ident, ident).subscribe((data: any) => {
        console.log(data.client);

        if (data.client == null) {
          //this.toastrS.warning('No se encontraron resultados para la identificación seleccionada.')
          this.client = { tipo_ident_cliente: data.type_ident };
          this.identNotExist = true;
          this.searchingClient = false;
          return;
        }
        this.client = data.client;
        this.form.controls['id_cliente'].setValue(this.client.id_cliente);
        this.searchingClient = false;
      });
    }
  }

  openModalClients() {
    this.tableClients = true;
    this.modalS
      .open(this.modalClients, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'xl',
      })
      .result.then(
        (result: any) => {
          if (result === 'yes') {
          }
          return;
        },
        (reason) => {
          return;
        }
      );
  }

  openModalClient() {
    this.formClient = true;
    this.modalS
      .open(this.modalClient, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
      })
      .result.then(
        (result: any) => {
          if (result === 'yes') {
          }
          return;
        },
        (reason) => {
          return;
        }
      );
  }

  openModalMethodPayment(
    editPaymentMethod: any = null,
    wayPayment: any = null,
    pagarm: any = null
  ) {
    this.pagarm = pagarm;
    if (!editPaymentMethod) {
      var exist: any = this.cashPayments.filter(
        (item: any) => item.id_formapago == wayPayment
      );
      if (Object.keys(exist).length > 0) {
        editPaymentMethod = exist[0];
      }
    }
    // if (this.cancelPayment == 'contado' && editPaymentMethod) {

    //   let maxAmount: any = this.cashPaymentTotalPending();
    //   this.maxAmount = Number(editPaymentMethod.amount) + Number(maxAmount);

    // } else if (this.cancelPayment == 'contado') {

    //   this.maxAmount = this.cashPaymentTotalPending();

    // } else if (this.cancelPayment == 'crédito' && editPaymentMethod) {
    //   let maxAmount: any = this.creditPaymentTotalPending();
    //   this.maxAmount = Number(editPaymentMethod.amount) + Number(maxAmount);
    // } else {

    //   this.maxAmount = this.creditPaymentTotalPending();
    // }

    this.editPaymentMethod = editPaymentMethod;
    if (wayPayment) {
      this.wayPayment = wayPayment;
    } else {
      this.wayPayment = null;
    }
    this.formMethodPayment = true;

    this.modalS
      .open(this.modalMethodPayment, {
        ariaLabelledBy: 'modal-basic-title',
        size: pagarm ? 'md' : 'lg',
      })
      .result.then(
        (result: any) => {
          if (result === 'yes') {
          }
          return;
        },
        (reason) => {
          return;
        }
      );
  }

  openModalWarning(text: string) {
    this.textModalWarning = text;

    this.modalS
      .open(this.modalWarning, {
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        size: 'md',
      })
      .result.then(
        (result: any) => {
          if (result === 'yes') {
          }
          return;
        },
        (reason) => {
          return;
        }
      );
  }

  // openModalPrint() {
  //   this.billingS.dataPrintInvoice(this.nro_factura).subscribe((data: any) => {
  //     this.invoicePrint = data;
  //     this.invoiceDetails = data.detalles;

  //   });
  // }

  openModalProducts() {
    this.formProducts = true;

    this.modalS
      .open(this.modalProducts, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
      })
      .result.then(
        (result: any) => {
          if (result === 'yes') {
          }
          return;
        },
        (reason) => {
          return;
        }
      );
  }

  hideModals() {
    this.modalS.dismissAll();
    let self = this;
    setTimeout(function () {
      self.tableClients = false;
      self.formClient = false;
      self.formProducts = false;
      self.formMethodPayment = true;
    }, 300);
  }

  // pagar
  pay() {
    this.loading = true;
    this.form.markAllAsTouched();

    if (!this.form.controls['id_cliente'].value) {
      this.loading = false;
      this.warning('Debe seleccionar un cliente antes continuar.');
      return;
    }

    // if (this.products.length == 0) {
    //   this.loading = false;
    //   this.warning('Debe agregar un producto antes continuar.');
    //   return;
    // }

    for (var pro of this.products) {
      if (!pro.pro_precioventa || !pro.cantidad) {
        this.loading = false;
        this.warning('uno o varios productos tienen valores incorrectos.');
        return;
      }
    }

    if (this.total <= 0) {
      this.loading = false;

      this.warning('El valor de la factura debe ser superior a 0');
      return;
    }

    let credito = false;
    this.payments.forEach((el: any) => {
      if (el.type == 'CRÉDITO') {
        credito = true;
      }
    });

    if (credito && this.client.nom_cliente == 'CONSUMIDOR FINAL') {
      this.loading = false;
      this.warning(
        'No se puede generar un crédito para un cliente "Consumidor final"'
      );
      return;
    }

    this.form.markAllAsTouched();
    let observaciones = this.observaciones.nativeElement.value;
    let tipo_documento = this.tipo_documento.nativeElement.value;
    let cancel_payment = false;
    // let formasDePago;
    // if (this.cancelPayment == 'contado') {
    //   formasDePago = this.cashPayments;
    // } else {
    //   formasDePago = this.creditPayments;
    // }

    // let cancel_payment = this.cancelPayment;
    let formasdepago = this.payments;
    this.billingS
      .pay(
        this.form.controls['id_cliente'].value,
        this.products,
        this.total,
        observaciones,
        cancel_payment,
        formasdepago,
        tipo_documento,
        this.caja_id,
        this.totaldescuento,
        this.descontar ? this.descontar : 0
      )
      .subscribe(
        (data: any) => {
          console.log(data);

          if (data.result == 'ok') {
            this.reloadTable();
            this.toastrS.success(data.message);
            this.loading = false;
            this.nro_factura = data.nro_factura;
            this.lockscards = true;
            this.invoicePrint = data.facturaprint;
            this.hideModals();
            this.invoiceDetails = data.invoiceDetails.detalles1;
          }
        },
        (error) => {
          this.loading = false;
          console.log(error);
        }
      );
  }

  // Calculos productos
  addProduct(data: any) {
    data = JSON.parse(JSON.stringify(data));
    let exist = false;
    for (const obj of this.products) {
      if (obj.pro_id === data.pro_id && data.pro_codigobarra != 'FL1') {
        obj.cantidad += 1;
        exist = true;
        break;
      }
    }

    if (!exist) {
      data.typeDesc = 'dollar';
      data.cantidad = 1;
      data.desc = 0;
      data.descmonto = 0;

      data.descPorcentage = 0;
      data.descmonto = 0;
      data.porcdesc = 0;
      data.descsubtotal = 0;

      if (data.pro_grabaiva == '1') {
        let price =
          Number(data.pro_precioventa) + Number(data.pro_precioventa) * 0.12;
        data.pro_precioventa = this.DecimalP.transform(price, '1.2-4');
      } else {
        data.pro_precioventa = this.DecimalP.transform(
          data.pro_precioventa,
          '1.2-4'
        );
      }

      data.precioOriginal = data.pro_precioventa;
      data.price_correct = data.pro_precioventa;

      if (this.type_priceG == 'original') {
        data.type_price = 'original';
      } else if (this.type_priceG == 'personalizado') {
        data.type_price = 'personalizado';
      } else {
        var precio: any = data.precios.filter(
          (item: any) => item.id_precios == this.type_priceG
        );
        data.pro_precioventa = precio[0].monto;

        data.type_price = this.type_priceG;
      }

      data.totalsiniva = data.cantidad * data.pro_precioventa;
      data.totalsiniva_nodesc = data.cantidad * data.pro_precioventa;

      data.total = data.pro_precioventa;
      data.totalNodesc = data.cantidad * data.pro_precioventa;
      this.products.push(data);
    }
    this.invoiceCalculations();
    console.log(this.products);
  }

  invoiceCalculations() {
    this.total = 0;
    this.totaldescuento = 0;
    this.totalconniva = 0;
    this.totalsinniva = 0;
    let totalprice = 0;
    let descontarcada = this.descontar;

    let totalPrices = 0;

    for (let pro of this.products) {
      let pro_precioventa: any = this.DecimalP.transform(
        pro.pro_precioventa,
        '1.2-4'
      );
      pro.totalsiniva_nodesc = pro.cantidad * (pro_precioventa / 1.12);

      if (this.applyDiscountG) {
        if (this.resetDiscount) {
          pro.descmonto = 0;
        } else if (descontarcada > 0) {
          if (descontarcada >= pro.totalsiniva_nodesc) {
            pro.descmonto = pro.totalsiniva_nodesc;
            descontarcada = descontarcada - pro.totalsiniva_nodesc;
          } else {
            pro.descmonto = descontarcada;
            descontarcada = 0;
          }
        } else {
          pro.descmonto = 0;
        }
      }

      // if (pro.pro_grabaiva == 1) {

      // pro.descsubtotal = ((pro.cantidad * pro_precioventa) - porcentajeiva);
      // pro.totalNodesc = (pro.cantidad * pro_precioventa) - porcentajeiva;

      // pro.totalsiniva = ((pro.cantidad * pro_precioventa) - pro.descmonto) - (((pro.cantidad * pro_precioventa) - pro.descmonto) * 0.12);
      pro.totalsiniva = pro.cantidad * (pro_precioventa / 1.12) - pro.descmonto;

      pro.total = pro.totalsiniva * 1.12;

      // } else {
      //   pro.descsubtotal = (pro.cantidad * pro_precioventa);
      //   pro.totalNodesc = pro.cantidad * pro_precioventa;

      //   pro.total = (pro.cantidad * pro_precioventa);
      //   pro.totalsiniva = (pro.cantidad * pro_precioventa);
      // }

      this.totaldescuento += Number(pro.descmonto);
      this.totalconniva += Number(pro.total);
      this.totalsinniva += Number(pro.totalsiniva);
      console.log(pro.total);

      this.total += Number(pro.total);

      totalprice += Number(pro.totalsiniva);
      // Incluir al final el desglose de subtotal, subtotal Iva, descuento y total
    }
    this.total = this.DecimalP.transform(this.total, '1.2-2');
    let descontargeneral: any = 0;
    if (this.descontar) {
      descontargeneral = this.descontar;
    }

    // this.totaldescuento = Number(this.totaldescuento) + Number(descontargeneral);
    // let totalsinivadesc = Number(totalprice) - Number(this.totaldescuento)
    // this.total = totalsinivadesc + (Number(totalsinivadesc) * 0.12);
    this.totaliva = this.total;
    // this.totalconniva = totalsinivadesc;
    // this.totalsinniva = Number(totalprice) - Number(this.totaldescuento);
    this.applyDiscountG = false;
    this.resetDiscount = false;

    this.childMP.autoPayment(this.total);
    // this.addPaymentMethod();
  }

  // subtotal XXXX
  // precio
  // iva XXXX
  // montoiva
  // descmonto
  // descsubtotal
  // id_almacen
  // tipprecio
  // porcdesc
  // descripcion
  // subsidio
  // costo_unitario
  // costo_total

  deleteProd(id: number) {
    this.products = this.products.filter(
      (item: any, index: any) => index !== id
    );
    this.changeDInput.nativeElement.value = 0;
    this.descontar = 0;
    this.invoiceCalculations();
  }

  warning(message: any) {
    this.toastrS.warning(message);
  }

  documentClient(client: any) {
    if (client.tipo_ident_cliente == 'R') {
      return 'RUC: ' + client.ident_cliente;
    } else if (client.tipo_ident_cliente == 'C') {
      return 'CEDULA: ' + client.ident_cliente;
    } else {
      return 'PASAPORTE: ' + client.ident_cliente;
    }
  }

  changeCant(event: any) {
    let id = event.target.id;
    let value = event.target.value;
    // setTimeout(() => {

    this.products.forEach((pro: any, index: any) => {
      if (id == index) {
        pro.cantidad = value;
      }
    });

    this.invoiceCalculations();
    // }, 100);
  }

  changeNameProduct(event: any) {
    let id = event.target.id;
    let value = event.target.value;
    this.products.forEach((pro: any, index: any) => {
      if (id == index) {
        pro.pro_nombre = value;
      }
    });

    console.log(this.products);
  }

  changePorcentageDesc(event: any) {
    this.descontar = 0;
    this.descontarPorcentaje = 0;
    let id = event.target.id;
    let value = event.target.value;
    var regexp = /^\d+(\.\d+)?$/;
    // setTimeout(() => {

    this.products.forEach((pro: any, index: any) => {
      if (id == index) {
        if (!value && Number.isNaN(Number(value))) {
          // event.target.value = 0;
          // pro.descmonto = 0;
          // pro.porcdesc = 0;
        } else if (pro.typeDesc == 'porcentage') {
          if (value > 100) {
            event.target.value = 100;
            pro.porcdesc = 100;
          } else {
            pro.porcdesc = value;
          }
        } else if (pro.typeDesc == 'dollar') {
          let totalNoIvaNoDesc = pro.cantidad * pro.totalsiniva_nodesc;

          if (value > totalNoIvaNoDesc) {
            pro.descmonto = totalNoIvaNoDesc;
          } else if (value > 9999999999) {
            event.target.value = 9999999999;
            pro.descmonto = 9999999999;
          } else {
            pro.descmonto = value;
          }
        }
      }
    });
    this.invoiceCalculations();
    // }, 100);
  }

  changePriceG(e: any) {
    var value = e.target.value;
    this.type_priceG = value;
    this.products.forEach((element: any, index: any) => {
      this.changePrice(value, index);
    });
  }

  changePrice(value: any, id: any) {
    var pro = this.products.filter((pro: any, index: any) => index == id);
    pro = pro[0];

    if (value == 'personalizado') {
      this.products.forEach((pro: any, index: any) => {
        if (id == index) {
          pro.pro_precioventa = pro.precioOriginal;
          pro.price_correct = pro.precioOriginal;
          pro.type_price = 'personalizado';
        }
      });
    } else if (value == 'original') {
      pro.pro_precioventa = pro.precioOriginal;
      pro.price_correct = pro.precioOriginal;
      pro.type_price = value;
    } else {
      var precio: any = pro.precios.filter(
        (item: any) => item.id_precios == value
      );
      pro.pro_precioventa = precio[0].monto;
      pro.price_correct = precio[0].monto;
      pro.type_price = value;
    }

    this.invoiceCalculations();
  }

  changePriceE(event: any) {
    let value = event.target.value;
    let id = event.target.id;
    this.changePrice(value, id);
  }

  changeTypeDesc(event: any) {
    this.changeDInput.nativeElement.value = 0;
    this.descontar = 0;
    let value = event.target.value;
    let id = event.target.id;

    this.products.forEach((pro: any, index: any) => {
      if (id == index) {
        pro.descmonto = 0;
        pro.typeDesc = value;
      }
    });
    this.invoiceCalculations();
  }

  changePriceCustom(event: any) {
    this.changeDInput.nativeElement.value = 0;
    this.descontar = 0;
    let value = event.target.value;
    let id = event.target.id;
    // setTimeout(() => {
    if (value && !Number.isNaN(Number(value))) {
      this.products.forEach((pro: any, index: any) => {
        if (id == index) {
          pro.pro_precioventa = value;
        }
      });
    } else {
      this.products.forEach((pro: any, index: any) => {
        if (id == index) {
          pro.pro_precioventa = '';
          event.target.value = '';
        }
      });
    }
    this.invoiceCalculations();
    // }, 100)
  }

  changeTypeDiscountG(event: any) {
    let value = event.target.value;
    this.type_discount_g = value;
    this.changeDInput.nativeElement.value = 0;
    this.descontar = 0;
    this.applyDiscountG = true;
    this.invoiceCalculations();
  }

  changeDiscount(event: any) {
    let descontar = event.target.value;

    this.applyDiscountG = true;
    let totalPrices = 0;
    for (let p of this.products) {
      totalPrices += Number(p.totalsiniva_nodesc);
    }
    // setTimeout(() => {
    if (descontar && !Number.isNaN(Number(descontar))) {
      if (this.type_discount_g == 'Porcentage') {
        if (descontar > 100) {
          descontar == 100;
          event.target.value = 100;
        }
        descontar = (totalPrices * descontar) / 100;
      } else {
        this.descontarPorcentaje = 0;
      }
      if (descontar <= 0) {
        this.descontar = 0;

        this.resetDiscount = true;
      } else if (descontar > totalPrices) {
        this.descontar = this.DecimalP.transform(totalPrices, '1.2-4');
        if (this.type_discount_g == 'Dollar') {
          event.target.value = totalPrices;
        }
      } else {
        this.descontar = this.DecimalP.transform(descontar, '1.2-4');
        if (this.type_discount_g == 'Dollar') {
          event.target.value = descontar;
        }
      }
    } else {
      this.resetDiscount = true;
      event.target.value = '';
    }
    this.invoiceCalculations();
    // }, 100)
  }

  formatNumber(number: number) {
    return this.DecimalP.transform(number, '1.2-4');
  }

  newF() {
    this.validateCajaEstatus();

    this.descontar = 0;
    this.tipo_documento.nativeElement.value = '01';
    this.resetClient();
    this.products = [];
    this.invoiceCalculations();
    this.cashPayments = [];
    this.payments = [];
    this.childMP.payments = [];

    this.creditPayments = [];
    this.nro_factura = '';
    this.invoicePrint = false;
    this.observaciones.nativeElement.value = '';
    this.lockscards = false;
    this.type_priceG = 'original';
  }

  resetClientNoCF(event: any) {
    var tident = event.target.value;
    console.log(tident);

    if (tident == 'R') {
      this.resetClient();
    } else {
      this.form.reset();
      this.client = { tipo_ident_cliente: tident, nom_cliente: '' };
      this.form.controls['tipo_ident_cliente'].setValue(tident);
    }
  }

  resetClient() {
    this.client = { tipo_ident_cliente: 'R', nom_cliente: 'CONSUMIDOR FINAL' };
    this.form.controls['id_cliente'].setValue(1);
    this.form.controls['tipo_ident_cliente'].setValue('R');
    this.form.controls['ident_cliente'].setValue('9999999999999');
    this.hideModals();
  }
  changeReceived(e: any) {
    this.received = e.target.value;
    console.log(this.received);
  }
  openModalPay() {
    this.received = this.totalReceived();
    this.modalS
      .open(this.modalPay, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'md',
      })
      .result.then(
        (result: any) => {
          if (result === 'yes') {
          }
          return;
        },
        (reason) => {
          return;
        }
      );
  }

  totalReceived() {
    var r: any = 0;
    this.payments.forEach((el: any) => {
      r = Number(r) + Number(el.amount);
    });
    return this.DecimalP.transform(r, '1.2-2');
  }

  cambio() {
    var r: any = 0;
    this.payments.forEach((el: any) => {
      r = Number(r) + Number(el.amount);
    });
    let total: any = this.received - this.total;

    return this.DecimalP.transform(total, '1.2-2');
  }

  cambioOf() {
    var cambio = this.cambio();
    if (Number(cambio) > 0) {
      return 'success';
    } else if (Number(cambio) == 0) {
      return 'secondary';
    } else {
      return 'danger';
    }
  }

  @HostListener('document:keydown.control.b') undo(event: KeyboardEvent) {
    if (this.lockscards) {
      return false;
    }
    this.inputCode.nativeElement.focus();
    setTimeout(() => {
      this.inputCode.nativeElement.value = '';
    }, 100);
  }

  @HostListener('document:keydown.shift.n') undo2(event: KeyboardEvent) {
    if (this.lockscards) {
      return false;
    }
    this.newF();
  }

  @HostListener('document:keydown.shift.c') undo3(event: KeyboardEvent) {
    if (this.lockscards) {
      return false;
    }
    this.openModalClient();
  }

  @HostListener('document:keydown.shift.p') undo4(event: KeyboardEvent) {
    if (this.lockscards) {
      return false;
    }
    if (this.total > 0) {
      this.openModalPay();
    } else {
      this.toastrS.warning('El total de la factura debe ser superior a 0.');
    }
  }
}
