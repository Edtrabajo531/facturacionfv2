import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ValidatorsService } from 'src/app/services/validators.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PaymentMethod } from 'src/app/models/paymentMethod.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-methods-payment',
  templateUrl: './methods-payment.component.html',
  styleUrls: ['./methods-payment.component.css'],
})
export class MethodsPaymentComponent implements OnInit {
  typesPayments = [
    {
      id_formapago: 1,
      cod_formapago: '01',
      nombre_formapago: 'EFECTIVO',
      esuninstrumentobanco: 0,
      estarjeta: 0,
    },

    {
      id_formapago: 2,
      cod_formapago: '20',
      nombre_formapago: 'CHEQUE',
      esuninstrumentobanco: 1,
      estarjeta: 0,
    },

    {
      id_formapago: 3,
      cod_formapago: '19',
      nombre_formapago: 'TARJETA DE CRÉDITO',
      esuninstrumentobanco: 0,
      estarjeta: 1,
    },

    {
      id_formapago: 4,
      cod_formapago: '16',
      nombre_formapago: 'TARJETA DE DEBITO',
      esuninstrumentobanco: 0,
      estarjeta: 1,
    },

    {
      id_formapago: 5,
      cod_formapago: '18',
      nombre_formapago: 'TARJETA PREPAGO',
      esuninstrumentobanco: 0,
      estarjeta: 1,
    },

    {
      id_formapago: 6,
      cod_formapago: '20',
      nombre_formapago: 'TRANSFERENCIA',
      esuninstrumentobanco: 1,
      estarjeta: 0,
    },

    {
      id_formapago: 7,
      cod_formapago: '17',
      nombre_formapago: 'DINERO ELECTRONICO',
      esuninstrumentobanco: 0,
      estarjeta: 0,
    },

    {
      id_formapago: 8,
      cod_formapago: '20',
      nombre_formapago: 'OTROS',
      esuninstrumentobanco: 1,
      estarjeta: 0,
    },

    {
      id_formapago: 9,
      cod_formapago: '20',
      nombre_formapago: 'DEVOLUCION',
      esuninstrumentobanco: 1,
      estarjeta: 0,
    },

    {
      id_formapago: 10,
      cod_formapago: '01',
      nombre_formapago: 'EFECTIVO DETALLE',
      esuninstrumentobanco: 1,
      estarjeta: 0,
    },
  ];

  form: FormGroup;
  now: any;
  payments: any = [];
  newPay: any = {};
  private dateValidators: any = [this.validatorsS.date];
  private targetValidators: any = [this.validatorsS.number];
  pagarm: any = false;
  @Input() edit: any = { index: undefined };
  @Input() maxAmount: any;
  @Input() total: any = 0;
  @ViewChild('modalPay') modalPay: ElementRef;

  @Output()
  sendToFather = new EventEmitter<any>();
  sendToFatherF(message: any) {
    this.sendToFather.emit(message);
  }
  @Output()
  sendDataToFather = new EventEmitter<any>();
  sendDataToFatherF(data: any) {
    this.sendDataToFather.emit(data);
  }

  constructor(
    private toastrS: ToastrService,
    private modalS: NgbModal,
    public datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private validatorsS: ValidatorsService,
    private DecimalP: DecimalPipe
  ) {}

  ngOnInit(): void {
    this.now = new Date();
    this.now = this.datePipe.transform(this.now, 'yyyy-MM-dd');
    this.formC();
  }

  formC(pre: any = false) {
    let value = null;

    if (this.edit.index != undefined || pre) {
      this.newPay = this.edit;
    } else {
      this.resetNewPay();
    }

    this.form = this.formBuilder.group({
      // id: [this.newPay?.cashPayment_id],
      type: [this.newPay?.type ? this.newPay?.type : 'CONTADO'],
      id_formapago: [this.newPay?.id_formapago, [Validators.required]],
      amount: [
        this.newPay.amount,
        [
          Validators.required,
          Validators.max(999999999999),
          this.validatorsS.float,
        ],
      ],
      bank: [this.newPay?.bank],
      date: [this.newPay.date],
      target: [this.newPay?.target],
      number_target: [this.newPay?.number_target],
      number_document: [this.newPay?.number_document],
      description_document: [this.newPay?.description_document],
      date_of_issue: [this.newPay.date_of_issue],
      date_of_withdrawal: [this.newPay.date_of_withdrawal],
      number_account: [this.newPay?.number_account],

      fechalimite: [this.newPay?.fechalimite],
      dias: [this.newPay?.dias],
      p100interes_credito: [this.newPay?.p100interes_credito],
      p100interes_mora: [this.newPay?.p100interes_mora],
      cantidadcuotas: [this.newPay?.cantidadcuotas],
      abonoinicial: [this.newPay?.abonoinicial],
      montointerescredito: [this.newPay?.montointerescredito],

      // <!--  *
      //  *
      // *
      // *
      // *
      // *
      // amount**
      // *
      // amount -->
    });

    if (this.newPay.id_formapago) {
      this.showExtras();
    }

    this.form?.get('id_formapago')?.valueChanges.subscribe((value) => {
      this.showExtras();
    });
    this.form?.get('type')?.valueChanges.subscribe((value) => {
      this.showExtras();
    });
    this.form?.get('bank')?.valueChanges.subscribe((value) => {
      console.log("CAHNGE BANK");
      console.log(value);

      
      if (value == '11') {
        this.form.controls['number_account'].setValue('44902945');
      } else if (value == '65') {
        this.form.controls['number_account'].setValue('2209795915');
      }
    });
    this.sendToFatherF('hideLoader');
  }
  resetNewPay() {
    this.edit.index = undefined;
    this.form?.get('amount')?.setValue(0);
    this.newPay = {
      type: 'CONTADO',
      amount: this.cashPaymentTotalPending(),
      id_formapago: 1,
      estarjeta: 0,
      esuninstrumentobanco: 0,
      cod_formapago: '01',
      nombre_formapago: 'EFECTIVO',
      fechalimite: this.now,
      dias: 1,
      p100interes_credito: 0,
      p100interes_mora: 0,
      cantidadcuotas: 1,
      abonoinicial: 0,
      montointerescredito: 0,
      date_of_issue: this.now,
      date_of_withdrawal: this.now,
      date: this.now,
    };
    // <!-- fechalimite *
    // dias *
    // p100interes_credito*
    // p100interes_mora*
    // cantidadcuotas*
    // abonoinicial*
    // amount**
    // montointerescredito*
    // amount -->
  }

  modalNewPay(index: any = undefined, type: any = false) {
    console.log(type);

    if (index != undefined) {
      this.edit = this.payments[index];
      this.edit.index = index;
      this.formC();
    } else if (type) {
      var typep: any;
      if (type == 'EFECTIVO') {
        this.payments.forEach((element: any, index: any) => {
          if (element.id_formapago == 1 && element.type == 'CONTADO') {
            this.edit = element;
            this.edit.index = index;
          }
        });
        if (this.edit.index == undefined) {
          var vtype: any = 'CONTADO';
          typep = this.typesPayments.filter(
            (item: any) => item.id_formapago == 1 && item.type == 'CONTADO'
          );
        }
      } else if (type == 'CRÉDITO') {
        this.payments.forEach((element: any, index: any) => {
          if (element.type == 'CRÉDITO') {
            this.edit = element;
            this.edit.index = index;
          }
        });
        if (this.edit.index == undefined) {
          var vtype: any = 'CRÉDITO';
          typep = this.typesPayments.filter(
            (item: any) => item.id_formapago == 1
          );
        }
      } else if (type == 'CHEQUE') {
        this.payments.forEach((element: any, index: any) => {
          if (element.id_formapago == 2) {
            this.edit = element;
            this.edit.index = index;
          }
        });
        if (this.edit.index == undefined) {
          var vtype: any = 'CONTADO';
          typep = this.typesPayments.filter(
            (item: any) => item.id_formapago == 2
          );
        }
      } else if (type == 'TARJETA C') {
        this.payments.forEach((element: any, index: any) => {
          if (element.id_formapago == 3) {
            this.edit = element;
            this.edit.index = index;
          }
        });
        if (this.edit.index == undefined) {
          var vtype: any = 'CONTADO';
          typep = this.typesPayments.filter(
            (item: any) => item.id_formapago == 3
          );
        }
      } else if (type == 'TARJETA D') {
        this.payments.forEach((element: any, index: any) => {
          if (element.id_formapago == 4) {
            this.edit = element;
            this.edit.index = index;
          }
        });
        if (this.edit.index == undefined) {
          var vtype: any = 'CONTADO';
          typep = this.typesPayments.filter(
            (item: any) => item.id_formapago == 4
          );
        }
      }

      if (this.edit.index == undefined) {
        if (!typep[0]) {
          typep = this.typesPayments.filter(
            (item: any) => item.id_formapago == 1
          );
        }
        this.edit = {
          index: undefined,
          type: vtype,
          amount: this.cashPaymentTotalPending(),
          id_formapago: typep[0].id_formapago,
          estarjeta: typep[0].estarjeta,
          esuninstrumentobanco: typep[0].esuninstrumentobanco,
          cod_formapago: typep[0].cod_formapago,
          nombre_formapago: typep[0].nombre_formapago,
          fechalimite: this.now,
          dias: 1,
          p100interes_credito: 0,
          p100interes_mora: 0,
          cantidadcuotas: 1,
          abonoinicial: 0,
          montointerescredito: 0,
          date_of_issue: this.now,
          date_of_withdrawal: this.now,
          date: this.now,
        };
      }
      this.formC(true);
    } else {
      this.resetNewPay();
      this.formC();
    }

    this.modalS
      .open(this.modalPay, {
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

  validate(name: string) {
    if (this.form) {
      return this.validatorsS.sow_message(this.form, name);
    }
    return { valid: null, error: null };
  }

  showExtras() {
    var id_formapago: any = this.form?.get('id_formapago')?.value;
    var type: any = this.form?.get('type')?.value;

    if (id_formapago) {
      var typep = this.typesPayments.filter(
        (item: any) => item.id_formapago == id_formapago
      );
      this.newPay.esuninstrumentobanco = typep[0].esuninstrumentobanco;
      this.newPay.estarjeta = typep[0].estarjeta;
      this.newPay.nombre_formapago = typep[0].nombre_formapago;
      this.newPay.cod_formapago = typep[0].cod_formapago;
      this.newPay.id_formapago = typep[0].id_formapago;
    } else {
      this.newPay.esuninstrumentobanco = 0;
      this.newPay.estarjeta = 0;
      this.newPay.nombre_formapago = 'EFECTIVO';
      this.newPay.cod_formapago = '01';
      this.newPay.id_formapago = 1;
    }
    this.newPay.type = type;

    console.log(this.newPay);

    if (
      this.newPay.esuninstrumentobanco == 1 &&
      this.newPay.type == 'CONTADO'
    ) {
      if (this.newPay.nombre_formapago != 'OTROS') {
        this.form?.get('bank')?.setValidators(Validators.required);
        this.form?.get('bank')?.updateValueAndValidity();
      } else {
        this.form?.get('bank')?.clearValidators();
      }

      if(!this.form?.get('bank')?.value){
        this.form.controls['number_account'].setValue('44902945');
        this.form.controls['bank'].setValue('11');
      }
     

      this.form
        ?.get('date_of_issue')
        ?.setValidators(this.dateValidators.concat(Validators.required));
      this.form?.get('date_of_issue')?.updateValueAndValidity();
      this.form
        ?.get('date_of_withdrawal')
        ?.setValidators(this.dateValidators.concat(Validators.required));
      this.form?.get('date_of_withdrawal')?.updateValueAndValidity();
      this.form?.get('date')?.clearValidators();
      this.form?.get('date')?.updateValueAndValidity();
      this.form?.get('target')?.clearValidators();
      this.form?.get('target')?.updateValueAndValidity();
    } else if (this.newPay.estarjeta == 1 && this.newPay?.type == 'CONTADO') {
      this.form?.get('bank')?.setValidators(Validators.required);
      this.form?.get('bank')?.updateValueAndValidity();

      this.form?.get('date_of_issue')?.clearValidators();
      this.form?.get('date_of_issue')?.updateValueAndValidity();

      this.form?.get('date_of_withdrawal')?.clearValidators();
      this.form?.get('date_of_withdrawal')?.updateValueAndValidity();

      this.form
        ?.get('date')
        ?.setValidators(this.dateValidators.concat(Validators.required));
      this.form?.get('date')?.updateValueAndValidity();

      this.form?.get('target')?.setValidators(Validators.required);
      this.form?.get('target')?.updateValueAndValidity();

      this.form.controls['number_account'].setValue('44902945');
      this.form.controls['bank'].setValue('11');
    } else {
      this.form?.get('bank')?.clearValidators();
      this.form?.get('date_of_issue')?.clearValidators();
      this.form?.get('date_of_withdrawal')?.clearValidators();
      this.form?.get('date')?.clearValidators();
      this.form?.get('target')?.clearValidators();
      this.form?.get('bank')?.updateValueAndValidity();
      this.form?.get('date_of_issue')?.updateValueAndValidity();
      this.form?.get('date_of_withdrawal')?.updateValueAndValidity();
      this.form?.get('date')?.updateValueAndValidity();
      this.form?.get('target')?.updateValueAndValidity();
    }

    if (type == 'CRÉDITO') {
      this.form?.get('fechalimite')?.setValidators(Validators.required);
      this.form?.get('fechalimite')?.updateValueAndValidity();

      this.form?.get('dias')?.setValidators(Validators.required);
      this.form?.get('dias')?.updateValueAndValidity();

      this.form?.get('p100interes_credito')?.setValidators(Validators.required);
      this.form?.get('p100interes_credito')?.updateValueAndValidity();

      this.form?.get('p100interes_mora')?.setValidators(Validators.required);
      this.form?.get('p100interes_mora')?.updateValueAndValidity();

      this.form?.get('cantidadcuotas')?.setValidators(Validators.required);
      this.form?.get('cantidadcuotas')?.updateValueAndValidity();

      this.form?.get('abonoinicial')?.setValidators(Validators.required);
      this.form?.get('abonoinicial')?.updateValueAndValidity();

      this.form?.get('montointerescredito')?.setValidators(Validators.required);
      this.form?.get('montointerescredito')?.updateValueAndValidity();
    } else {
      this.form?.get('fechalimite')?.clearValidators();
      this.form?.get('fechalimite')?.updateValueAndValidity();

      this.form?.get('dias')?.clearValidators();
      this.form?.get('dias')?.updateValueAndValidity();

      this.form?.get('p100interes_credito')?.clearValidators();
      this.form?.get('p100interes_credito')?.updateValueAndValidity();

      this.form?.get('p100interes_mora')?.clearValidators();
      this.form?.get('p100interes_mora')?.updateValueAndValidity();

      this.form?.get('cantidadcuotas')?.clearValidators();
      this.form?.get('cantidadcuotas')?.updateValueAndValidity();

      this.form?.get('abonoinicial')?.clearValidators();
      this.form?.get('abonoinicial')?.updateValueAndValidity();

      this.form?.get('montointerescredito')?.clearValidators();
      this.form?.get('montointerescredito')?.updateValueAndValidity();
    }
  }

  submit() {
    this.sendToFatherF('showLoader');
    this.validatorsS.remove_errors_server(this.form);
    this.form.markAllAsTouched();

    if (this.form.status == 'INVALID') {
      this.sendToFatherF('hideLoader');
      return;
    }

    let tp: any = this.payments.filter(
      (item: any) => item.id_formapago == this.form?.get('id_formapago')?.value
    );

    this.showExtras();
    var vpay: any = this.form.value;
    vpay.nombre_formapago = this.newPay.nombre_formapago;
    if (this.edit.index != undefined) {
      this.payments[this.edit.index] = vpay;
    } else {
      if (this.newPay.type == 'CRÉDITO') {
        var exist = this.payments.filter(
          (item: any, index: any) => item.type == 'CRÉDITO'
        );
        if (exist.length != 0) {
          this.toastrS.warning('Ya existe un pago de tipo: "CRÉDITO"');
          this.sendToFatherF('hideLoader');
          return;
        }
      } else if (this.newPay.type == 'CONTADO') {
        var exist = this.payments.filter(
          (item: any, index: any) =>
            item.id_formapago == this.newPay.id_formapago
        );
        console.log(this.newPay.id_formapago);

        if (exist.length != 0) {
          this.toastrS.warning(
            'Ya existe un pago con forma de pago: "' +
              this.newPay.nombre_formapago +
              '"'
          );
          this.sendToFatherF('hideLoader');
          return;
        }
      }
      this.payments.push(vpay);
    }

    this.resetNewPay();
    this.modalS.dismissAll();
    this.sendDataToFatherF(this.payments);
  }

  cashPaymentTotalPending() {
    let total: any = 0;
    if (this.edit.index != undefined) {
      var payments = this.payments.filter(
        (item: any, index: any) => index != this.edit.index
      );
    } else {
      var payments = this.payments;
    }

    payments.forEach((element: any) => {
      total = total + Number(element.amount);
    });

    total = this.total - total;

    total = total - Number(this.form?.get('amount')?.value);

    total = this.DecimalP.transform(total, '1.2-2');

    return total;
  }

  deletePayment(indexv: any) {
    this.payments = this.payments.filter(
      (item: any, index: any) => index != indexv
    );
    this.sendDataToFatherF(this.payments);
  }

  autoPayment(total: any) {
    var length = Object.keys(this.payments).length;
    if (length == 0 && total > 0) {
      var newp = {
        type: 'CONTADO',
        amount: total,
        id_formapago: 1,
        estarjeta: 0,
        esuninstrumentobanco: 0,
        cod_formapago: '01',
        nombre_formapago: 'EFECTIVO',
        fechalimite: this.now,
        dias: 1,
        p100interes_credito: 0,
        p100interes_mora: 0,
        cantidadcuotas: 1,
        abonoinicial: 0,
        montointerescredito: 0,
        date_of_issue: this.now,
        date_of_withdrawal: this.now,
        date: this.now,
      };
      console.log('new p');

      this.payments.push(newp);
      this.sendDataToFatherF(this.payments);
    } else if (length == 1) {
      this.payments[0].amount = total;
      this.sendDataToFatherF(this.payments);
    }
  }
}
