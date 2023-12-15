import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorsService } from 'src/app/services/validators.service';
import { ToastrService } from 'ngx-toastr';
import {  Router } from '@angular/router';
import { BillingService } from '../../../services/billing.service';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.css']
})

export class AddClientComponent implements OnInit {
  form: FormGroup;
  client:any;
  change_ident = false;
  loading = true;
  @Input() clientSelected:any;
  @Output() sendToDataF = new EventEmitter<any>();
  @Output() sendToF = new EventEmitter<any>();
  @ViewChild('content') content: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
    private validatorsS: ValidatorsService,
    private toastrS:ToastrService,
    private router:Router,
    private billingS:BillingService
  ) {

  }

  sendToDataFather(message:any){
    this.sendToDataF.emit(message);
  }
  
  sendToFather(message:any){
    this.sendToF.emit(message);
  }

  ngOnInit(): void {
    if(!this.clientSelected?.nom_cliente){
      this.clientSelected = ""
    }
    this.formR();
  }
   
  formR() {
    this.loading = false;
    this.form = this.formBuilder.group(
      {
        id_cliente:[this.clientSelected?.id_cliente],
        tipo_ident_cliente: [this.clientSelected?.tipo_ident_cliente, [Validators.required]],
        ident_cliente: [this.clientSelected?.ident_cliente, [Validators.required]],
        nom_cliente: [this.clientSelected?.nom_cliente, [Validators.required]],
        telefonos_cliente: [this.clientSelected?.telefonos_cliente, [ this.validatorsS.number]],
        correo_cliente: [this.clientSelected?.correo_cliente, [Validators.email]],
        ciudad_cliente: [this.clientSelected?.ciudad_cliente, [Validators.required, ]],
        direccion_cliente: [this.clientSelected?.direccion_cliente],
        placa_matricula: [this.clientSelected?.placa_matricula,this.validatorsS.number],
        change_ident: [0],
      },{ validator: this.validateTypeDoc }
    );
  }
  
  validateTypeDoc(frm: FormGroup) {
    if (
      frm.controls['change_ident'].value == 1 && frm.controls['tipo_ident_cliente'].value.length != 0 && frm.controls['tipo_ident_cliente'].value == 'R' && frm.controls['ident_cliente'].value.length != 13  && frm.controls['ident_cliente'].value.length != 0
    ) {
      return { ident_ruc: true };
    } else if(frm.controls['change_ident'].value == 1 &&  frm.controls['tipo_ident_cliente'].value.length != 0 && frm.controls['tipo_ident_cliente'].value == 'C' && frm.controls['ident_cliente'].value.length != 10 && frm.controls['ident_cliente'].value.length != 0) {
      return { ident_c: true };
    } else if( frm.controls['change_ident'].value == 1 && frm.controls['tipo_ident_cliente'].value.length != 0 && frm.controls['tipo_ident_cliente'].value == 'P' && frm.controls['ident_cliente'].value.length != 9 && frm.controls['ident_cliente'].value.length != 0) {
      return { ident_p: true };
    }else{
      return;
    }
  }

  submit() {
     
    this.loading = true;
    this.validatorsS.remove_errors_server(this.form);
    this.form.markAllAsTouched();
    if (this.form.status == 'INVALID') {
    
      this.loading = false;
      return;
      
    }

    this.billingS.storeUpdateClient(this.form.value).subscribe(
      (response: any) => {
        this.loading = false;
        let detect_errors_server = this.validatorsS.detect_errors_server(response,this.form);
        if(detect_errors_server){
          return;
        }
        
        this.sendToDataFather(response.data);
      },
      (error) => {
        this.loading = false;
        console.log(error);
      }
    );
  }

  validate(name: string) {
    return this.validatorsS.sow_message(this.form, name);
  }

  onChangeIdent(){
    this.form.controls['change_ident'].setValue(1);
  }
}