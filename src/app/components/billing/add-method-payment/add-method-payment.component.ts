import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ValidatorsService } from 'src/app/services/validators.service';
import { DatePipe, DecimalPipe } from '@angular/common';

import { PaymentMethod } from 'src/app/models/paymentMethod.model';

@Component({
  selector: 'app-add-method-payment',
  templateUrl: './add-method-payment.component.html',
  styleUrls: ['./add-method-payment.component.css'],
})
export class AddMethodPaymentComponent implements OnInit {
  @Input() cancelPayment: any;
  @Input() editPaymentMethod: PaymentMethod;
  @Input() wayPayment: any;
  @Input() maxAmount: any;
  @Input() cashPayments: any;
  @Input() total: any;
  @Input() pagarm: any;



  form1: FormGroup;
  loading = true;

  typePay: any = {type:""};

  useCard: any;
  useBank: any;

  wayPayments = [
    {
      id_formapago: 1,
      cod_formapago: "01",
      nombre_formapago: 'EFECTIVO',
      esuninstrumentobanco: 0,
      estarjeta: 0,
    },

    {
      id_formapago: 2,
      cod_formapago: "20",
      nombre_formapago: 'CHEQUE',
      esuninstrumentobanco: 1,
      estarjeta: 0,
    },

    {
      id_formapago: 3,
      cod_formapago: "19",
      nombre_formapago: 'TARJETA DE CRÉDITO',
      esuninstrumentobanco: 0,
      estarjeta: 1,
    },

    {
      id_formapago: 4,
      cod_formapago: "16",
      nombre_formapago: 'TARJETA DE DEBITO',
      esuninstrumentobanco: 0,
      estarjeta: 1,
    },

    {
      id_formapago: 5,
      cod_formapago: "18",
      nombre_formapago: 'TARJETA PREPAGO',
      esuninstrumentobanco: 0,
      estarjeta: 1,
    },

    {
      id_formapago: 6,
      cod_formapago: "20",
      nombre_formapago: 'TRANSFERENCIA',
      esuninstrumentobanco: 1,
      estarjeta: 0,
    },

    {
      id_formapago: 7,
      cod_formapago: "17",
      nombre_formapago: 'DINERO ELECTRONICO',
      esuninstrumentobanco: 0,
      estarjeta: 0,
    },

    {
      id_formapago: 8,
      cod_formapago: "20",
      nombre_formapago: 'OTROS',
      esuninstrumentobanco: 1,
      estarjeta: 0,
    },

    {
      id_formapago: 9,
      cod_formapago: "20",
      nombre_formapago: 'DEVOLUCION',
      esuninstrumentobanco: 1,
      estarjeta: 0,
    },

    {
      id_formapago: 10,
      cod_formapago: "01",
      nombre_formapago: 'EFECTIVO DETALLE',
      esuninstrumentobanco: 1,
      estarjeta: 0,
    },
  ];
  date: any;
  date_of_issue: any;
  date_of_withdrawal: any;
  id_formapago: any;
  amount: any;
  private dateValidators: any = [this.validatorsS.date];
  private targetValidators: any = [this.validatorsS.number];

  now: any;
  @Output()
  sendToF = new EventEmitter<any>();
  @Output()
  sendToFD = new EventEmitter<any>();
  @Output()
  sendToFDUpdate = new EventEmitter<any>();

  @ViewChild('content') content: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
    private validatorsS: ValidatorsService,
    private toastrS: ToastrService,
    private datePipe: DatePipe,
    private router: Router,
    private DecimalP: DecimalPipe,
  ) { }

  sendToFather(message: any) {
    this.sendToF.emit(message);
  }
  sendToFatherD(data: any) {
    this.sendToFD.emit(data);
  }
  sendToFatherUpdateD(data: any) {
    this.sendToFDUpdate.emit(data);
  }
  ngOnInit(): void {

    this.now = new Date();
    this.now = this.datePipe.transform(this.now, 'yyyy-MM-dd');
    this.formC1();
  }

  formC1() {
    let value = null;

    if (!this.editPaymentMethod?.date) {
      this.date = this.now;
    } else {
      this.date = this.editPaymentMethod?.date
    }
    if (!this.editPaymentMethod?.date_of_issue) {
      this.date_of_issue = this.now;
    } else {
      this.date_of_issue = this.editPaymentMethod?.date_of_issue
    }
    if (!this.editPaymentMethod?.date_of_withdrawal) {
      this.date_of_withdrawal = this.now;
    } else {
      this.date_of_withdrawal = this.editPaymentMethod?.date_of_withdrawal
    }

    if (this.wayPayment) {
      this.id_formapago = this.wayPayment;
    } else {
      this.id_formapago = this.editPaymentMethod?.id_formapago;
    }

    if (this.editPaymentMethod?.amount) {
      this.amount = this.DecimalP.transform(this.editPaymentMethod?.amount, '0.2-2');
    } else if (this.maxAmount) {
      this.amount = this.DecimalP.transform(this.maxAmount, '0.2-2');
    }

    this.form1 = this.formBuilder.group({
      id: [this.editPaymentMethod?.cashPayment_id],
      type: [this.editPaymentMethod?.type ? this.editPaymentMethod?.type : 'CONTADO'],
      id_formapago: [this.id_formapago ? this.id_formapago : 1, [Validators.required]],
      amount: [this.amount.toString(), [Validators.required, Validators.max(999999999999), this.validatorsS.float]],
      bank: [this.editPaymentMethod?.bank,],
      date: [this.date,],
      target: [this.editPaymentMethod?.target,],
      number_target: [this.editPaymentMethod?.number_target,],
      number_document: [this.editPaymentMethod?.number_document,],
      description_document: [this.editPaymentMethod?.description_document,],
      date_of_issue: [this.date_of_issue,],
      date_of_withdrawal: [this.date_of_withdrawal,],
      number_account: [this.editPaymentMethod?.number_account,],
    });

    if (this.id_formapago) {
      this.showExtras();
    }

    this.form1?.get('id_formapago')?.valueChanges.subscribe(value => {
      this.showExtras();
    });
    this.form1?.get('type')?.valueChanges.subscribe(value => {
      this.showExtras();
    });
    this.sendToFather('hideLoader');
  }

  showExtras() {
    var id_formapago:any = this.form1?.get('id_formapago')?.value;
    var type:any = this.form1?.get('type')?.value;

    if (id_formapago) {
      this.typePay = this.wayPayments.filter((item: any) => item.id_formapago == id_formapago);
      this.typePay = this.typePay[0];
    }else{
      this.typePay = null;
    }
    this.typePay.type = type;
    if (this.typePay.esuninstrumentobanco == 1 && type == 'CONTADO') {
      this.form1?.get('bank')?.setValidators(Validators.required);
      this.form1?.get('bank')?.updateValueAndValidity();
      this.form1?.get('date_of_issue')?.setValidators(this.dateValidators.concat(Validators.required));
      this.form1?.get('date_of_issue')?.updateValueAndValidity();
      this.form1?.get('date_of_withdrawal')?.setValidators(this.dateValidators.concat(Validators.required));
      this.form1?.get('date_of_withdrawal')?.updateValueAndValidity();
      this.form1?.get('date')?.clearValidators();
      this.form1?.get('date')?.updateValueAndValidity();
      this.form1?.get('target')?.clearValidators();
      this.form1?.get('target')?.updateValueAndValidity();

    } else if (this.typePay.estarjeta == 1 && this.typePay.type == 'CONTADO') {
      this.form1?.get('bank')?.setValidators(Validators.required);
      this.form1?.get('bank')?.updateValueAndValidity();

      this.form1?.get('date_of_issue')?.clearValidators();
      this.form1?.get('date_of_issue')?.updateValueAndValidity();

      this.form1?.get('date_of_withdrawal')?.clearValidators();
      this.form1?.get('date_of_withdrawal')?.updateValueAndValidity();

      this.form1?.get('date')?.setValidators(this.dateValidators.concat(Validators.required));
      this.form1?.get('date')?.updateValueAndValidity();

      this.form1?.get('target')?.setValidators(Validators.required);
      this.form1?.get('target')?.updateValueAndValidity();

    } else {
      this.form1?.get('bank')?.clearValidators();
      this.form1?.get('date_of_issue')?.clearValidators();
      this.form1?.get('date_of_withdrawal')?.clearValidators();
      this.form1?.get('date')?.clearValidators();
      this.form1?.get('target')?.clearValidators();
      this.form1?.get('bank')?.updateValueAndValidity();
      this.form1?.get('date_of_issue')?.updateValueAndValidity();
      this.form1?.get('date_of_withdrawal')?.updateValueAndValidity();
      this.form1?.get('date')?.updateValueAndValidity();
      this.form1?.get('target')?.updateValueAndValidity();
    }

    if (this.typePay.type == 'CRÉDITO') {

    }
  }
  submit() {

    this.sendToFather('showLoader');
    this.validatorsS.remove_errors_server(this.form1);
    this.form1.markAllAsTouched();
    if (this.form1.status == 'INVALID') {
      this.sendToFather('hideLoader');
      return;
    }

    let newpay = this.form1.value;

    let nombreformapago: any = this.wayPayments.filter((item: any) => item.id_formapago == this.form1?.get('id_formapago')?.value);

    nombreformapago = nombreformapago[0].nombre_formapago;
    newpay.nombre_formapago = nombreformapago;

    if (this.editPaymentMethod?.amount) {
      this.sendToFatherUpdateD(newpay);
    } else {
      this.sendToFatherD(newpay);
    }

    // this.planS.store(this.form.value).subscribe(
    //   (response: any) => {

    //     this.sendToFather('hideLoader');
    //     let detect_errors_server = this.validatorsS.detect_errors_server(response,this.form);
    //     if(detect_errors_server){
    //       return;
    //     }
    //     this.toastrS.success(response.message);
    //     this.sendToFather("newData");
    //   },
    //   (error) => {
    //     this.sendToFather('hideLoader');
    //     console.log(error);
    //   }
    // );
  }

  validate(name: string) {
    return this.validatorsS.sow_message(this.form1, name);
  }

  cashPaymentTotalPending() {
    let totalp: any = 0;
    this.cashPayments.forEach((element: any) => {
      if(this.editPaymentMethod?.cashPayment_id != element.cashPayment_id){
        totalp += Number(element.amount);
      }

    });
    totalp = totalp + Number(this.form1?.get('amount')?.value);
    var totalpen:any = (this.total - totalp);
    totalpen = this.DecimalP.transform(totalpen, '1.2-2');

    return totalpen;
  }
}
