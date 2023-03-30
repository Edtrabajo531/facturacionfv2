import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { BillingService } from '../../../services/billing.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})

export class ProductsComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  @ViewChild('buttons') buttons: any;
  dtTrigger: Subject<any> = new Subject<any>();
  formCreate = false;
  formEdit = false;
  dataEdit = [];
  caja_id = 0;
  @Input() selected: any;

  @Output() sendToFatherP = new EventEmitter<any>();
  @Output() sendToF = new EventEmitter<any>();
  @Output() sendToFatherPrecios = new EventEmitter<any>();

  constructor(
    private router: Router,
    private billingS: BillingService,
    private modalS: NgbModal,
    config: NgbModalConfig,
    private ToastrS: ToastrService,
    private decimalP: DecimalPipe,
    private activatedR:ActivatedRoute
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnChanges() {
    /**********THIS FUNCTION WILL TRIGGER WHEN PARENT COMPONENT UPDATES 'someInput'**************/
    //Write your code here
    // this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //   dtInstance.ajax.reload();
    // });
  }
  sendToFatherPre(precios:any){
    console.log(precios);

    this.sendToFatherPrecios.emit(precios)

  }
  sendToFatherProd(data: any) {
    this.sendToFatherP.emit(data)
  }
  sendToFather(message: any) {


    this.sendToF.emit(message);
  }
  ngOnInit(): void {

    let caja = this.activatedR.snapshot.paramMap.get('caja_id');
    if(caja == "caja-1"){
      this.caja_id = 1;
    }else if(caja == "caja-2"){
      this.caja_id = 10;
    }else{
      window.location.href = 'https://csempaques.actfacturas.com';
      return;
    }

    this.dtOptions = {
      order: [[1, "asc"]],
      lengthMenu: [[10, 20, 50, -1], [10, 20, 50, "Todas"]],
      pageLength: 10,
      responsive: true,
      pagingType: 'full_numbers',
      dom: `<'row'<'col-md-6'l><'col-md-6 mb-2'f>r>
          t
          <'row'<'col-md-6'i><'col-md-6'p>>`,
      language: {
        "lengthMenu": `Filas _MENU_`,
        "zeroRecords": "Datos no disponibles",
        "info": "Página <b>_PAGE_</b> de <b>_PAGES_</b>",
        "infoEmpty": "Datos no disponibles",
        "infoFiltered": "( Filtrando de _MAX_ entradas )",
        search: '<span class="hide-sm" style="margin-right:-4px;padding:5px 13px 8px 14px;border:solid 1px var(--grey);border-top-left-radius:4px;border-bottom-left-radius:4px;border-right:none" ><i class="fa fa-search"></i></span>',
        searchPlaceholder: " Buscar",
        "paginate": {
          "first": "",
          "last": "",
          "next": "Sig.",
          "previous": "Ant."
        },
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.billingS.products(this.caja_id).subscribe((data: any) => {
          console.log("data");
          console.log(data);
          console.log("data");

          var data2 = data.productos;




          this.sendToFatherPre(data.precios);

          this.dtTrigger.next("");
          this.sendToFather("hideLoader");

          callback({
            recordsTotal: data2.total,
            recordsFiltered: data2.to,
            data: data2
          });
        });
      },
      columns: [
        // {
        //   title: 'almacen id',
        //   data: 'almacen_id',
        //   orderable: true,
        // },
        {
          title: 'Cód. barra',
          data: 'pro_codigobarra',
          orderable: true,
        },
        {
          title: "Nombre",
          data: null,
          orderable: true,
          render: (data, type, full) => {

            var red;
            if(parseFloat(data.existencia) <= 0){
              red = 'text-danger';
            }else{
              red = '';
            }

            let selected = [];
            // selected = this.selected.filter((item: any) => item.pro_id == data.pro_id);
            if (selected.length != 0) {
              return `<div class="add_prod"><button type="button" class="btn btn-secondary btn-xs"> <i class="fas fa-plus"></i></button> <span class="${red}"> ${data.pro_nombre}</span></div>`;
            } else {
              return `<div class="add_prod"><button type="button" class="btn btn-success btn-xs"> <i class="fas fa-plus"></i></button> <span class="${red}"> ${data.pro_nombre} </span></div>`;

            }
          }
        },
        {
          title: "Stock",
          data: null,
          orderable: true,
          render: (data, type, full) => {
            var red;
            if(parseFloat(data.existencia) <= 0){
              red = 'text-danger';
            }else{
              red = '';
            }

            let selected = [];
            selected = this.selected.filter((item: any) => item.pro_id == data.pro_id);

            return `<div class=""><span class="${red}"> ${data.existencia}</span></div>`;



          }
        },
        {
          title: "Precio",
          data: null,
          orderable: true,
          render: (data, type, full) => {
            if(data.pro_grabaiva){
              var price = (parseFloat(data.pro_precioventa) * 0.12)+parseFloat(data.pro_precioventa);
              return `<div style="min-width:80px"> ${this.decimalP.transform(price, '1.2-2')} $</div>`;

            }else{
              return `<div style="min-width:80px"> ${this.decimalP.transform(data.pro_precioventa, '1.2-2')} $</div>`;
            }
          }

        },

        {
          title: 'Ubi.',
          data: 'ubicacion',
          orderable: true,
        },

        // {
        //   title: "Precio n iva",
        //   data: null,
        //   orderable: true,
        //   render: (data, type, full) => {
        //     if(data.pro_grabaiva){
        //       var price = data.pro_precioventa;
        //       return `<div style="min-width:80px"> ${this.decimalP.transform(price, '1.2-4')} $</div>`;

        //     }else{
        //       return `<div style="min-width:80px"> ${this.decimalP.transform(data.pro_precioventa, '1.2-4')} $</div>`;
        //     }
        //   }

        // },

        // {
        //   title: "Iva",
        //   data: null,
        //   orderable: true,
        //   render: (data, type, full) => {
        //     if (data.pro_grabaiva == 0) {
        //       return `<span class="text-secondary">0%</span>`;
        //     } else {
        //       return `<span class="text-dark">12%</span>`;
        //     }

        //   }

        // },

      ],
      rowCallback: (row: Node, data: any | Object, index: number) => {
        const self = this;

        $('td .add_prod', row).off('click');
        $('td .add_prod', row).on('click', (event) => {
          console.log(event);
          // $(event.currentTarget).find('button').removeClass('bg-success');
          // $(event.currentTarget).find('button').addClass('bg-secondary');
          this.sendToFatherProd(data);
        });


        $('td .add_prod', row).on('mouseleave', (event) => {



        });

      }
    };
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    //$.fn['dataTable'].ext.search.pop();
  }
}

