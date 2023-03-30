import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { BillingService } from '../../../services/billing.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})

export class ClientsComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  loading = true;
  dtTrigger: Subject<any> = new Subject<any>();
  formCreate = false;
  formEdit = false;
  dataEdit = [];
  
  @Output() sendDataToF = new EventEmitter<any>();
  //@Output() sendToF = new EventEmitter<any>();

  
  constructor(
    private router: Router,
    private billingS:BillingService,
    private modalS: NgbModal,
    config: NgbModalConfig,
    private ToastrS:ToastrService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
  

  
  ngOnInit(): void {
    
    this.dtOptions = {
      order: [[0, "asc"]],
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
        this.billingS.clients().subscribe((data: any) => {
          this.dtTrigger.next("");
          this.loading = false;

          callback({
            recordsTotal: data.total,
            recordsFiltered: data.to,
            data: data
          });
        });
      },
      columns: [
        {
          title: 'Nombre',
          data: 'nom_cliente',
          orderable: true,
        },
        {
          title: 'Tipo Ident.',
          data: 'tipo_ident_cliente',
          orderable: true,
        },
        {
          title: 'Identificación',
          data: 'ident_cliente',
          orderable: true,
        },
        {
          title: "Ciudad",
          data: 'ciudad_cliente',
          orderable: true,
        },
   
        {
          title: "Teléfono",
          data: 'telefonos_cliente',
          orderable: true,
        },
      

      ],
      rowCallback: (row: Node, data: any | Object, index: number) => {
        const self = this;

        $('td', row).off('click');
        $('td', row).on('click', () => {
          this.sendDataToFather(data);
          //this.sendToFather('hideModal');
        });

       
      }
    };
  }
  
  // sendToFather(value:any){
  //   this.sendToF.emit(value);
  // }
  sendDataToFather(data:any){
    this.sendDataToF.emit(data);
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    //$.fn['dataTable'].ext.search.pop();
  }
}


