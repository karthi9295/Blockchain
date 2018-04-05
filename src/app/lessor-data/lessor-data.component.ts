import { Component, OnInit } from '@angular/core';
import { SearchService } from '../Service/search.service'
import { DatePipe } from '@angular/common'


declare const $: any;

@Component({
  selector: 'app-lessor-data',
  templateUrl: './lessor-data.component.html',
  styleUrls: ['./lessor-data.component.css'],
  providers: [SearchService, DatePipe]
})
export class LessorDataComponent implements OnInit {
  selectrow: any;
  selectrowindex: number;
  searchDeatilsDataView: any;
  model: any = {};
  searchDeatilsData:any;
  searchDeatilsOriData:any;
  userdetails:any;
  filter:any;

  constructor(private searchservice: SearchService, private datePipe: DatePipe,) {    
  this.userdetails = JSON.parse(localStorage.getItem("userdetails"));
  this.searchDeatilsOriData = [];
  this.selectrowindex = -1;
  this.selectrow = { eventID: "", itemDesc: "", itemCode: "", customerName: "", quantity: "", pONumber: "", sOrder: "", amount: "", lessor1ROI: "", lessor2ROI: "", }
  this.filter = {
    CustomerName: "", PoDatefrom: "", PoDateTo: "", ItemCode: "", RejectionDateFrom: "", RejectionDateTo: "", PoNumber: "", Quantityfrom: "",
    QuantityTo: "", EventID: "", AmountRangeFrom: "", AmountRangeTo: "", Item: "", salesOrder: ""
  };
}

  ngOnInit() {
    this.loadPo();
  }


  loadPo() {
    debugger;
    this.searchservice.search(this.model.custname, this.model.ponum).subscribe(data => {
      var userdetails = JSON.parse(localStorage.getItem("userdetails"));
      this.searchDeatilsData = data;
      this.searchDeatilsData.forEach(element => {
        if(userdetails.role == "Ricoh"){
          if(element["lessor1"] == "CA"){
            element["bank"] = "Bank Of America";
            element["ROI"] = element["lessor1ROI"];
            this.searchDeatilsOriData.push(element);
          }
          if(element["lessor2"] == "CA"){
            element["bank"] = "JP Morgan";
            element["ROI"] = element["lessor2ROI"];
            this.searchDeatilsOriData.push(element);
          }
        }
        else  if((userdetails.role == "Bank") && (userdetails.userID == "BK01")){
          if(element["lessor1"] == "CA"){
            element["bank"] = "Bank Of America";
            element["ROI"] = element["lessor1ROI"];
            this.searchDeatilsOriData.push(element);
          }
        }
        else  if((userdetails.role == "Bank") && (userdetails.userID == "BK02")){
          if(element["lessor2"] == "CA"){
         /*(element["lessor2"] == "BS")? "Bid Submitted": */ 
            element["bank"] = "JP Morgan";
            element["ROI"] = element["lessor2ROI"];
            this.searchDeatilsOriData.push(element);
          }
        }
          else  if((userdetails.role == "Customer") && (userdetails.userID == element["customerID"])){
            if(element["lessor1"] == "CA"){
              element["bank"] = "Bank Of America";
              element["ROI"] = element["lessor1ROI"];
              this.searchDeatilsOriData.push(element);
            }
            if(element["lessor2"] == "CA"){
              element["bank"] = "JP Morgan";
              element["ROI"] = element["lessor2ROI"];
              this.searchDeatilsOriData.push(element);
            } 
        }
      });
      this.searchDeatilsDataView = this.searchDeatilsOriData;
    });
  }

  selectedRad(index) {
    this.selectrowindex = index;
    this.selectrow = this.searchDeatilsOriData[this.selectrowindex];
  }

  viewDts() {
    if (this.selectrowindex == -1) {
      $('#selectanyPO').modal('show');
      return;
    }
    else{
      $('#eventID').modal('show');
    }
    
  }
  /*viewDtspo() {
    if (this.selectrowindex == -1) {
      $('#selectanyPO').modal('show');
      return;
    }
    else{
    $('#PONum').modal('show');
    }
  }*/
  search() {
    debugger;
    this.searchDeatilsOriData = this.searchDeatilsDataView.filter(a => {
      var con1 = (this.filter.CustomerName == "" || a.customerName.toLowerCase().indexOf(this.filter.CustomerName.toLowerCase()) > -1)
        && (this.filter.ItemCode == "" || a.itemCode.toLowerCase().indexOf(this.filter.ItemCode.toLowerCase()) > -1)
        && (this.filter.PoNumber == "" || a.pONumber.toLowerCase().indexOf(this.filter.PoNumber.toLowerCase()) > -1)
        && (this.filter.EventID == "" || a.eventID.toLowerCase().indexOf(this.filter.EventID.toLowerCase()) > -1)
        && (this.filter.Item == "" || a.itemDesc.toLowerCase().indexOf(this.filter.Item.toLowerCase()) > -1)
        && (this.filter.salesOrder == "" || a.sOrder.toLowerCase() == this.filter.Status.toLowerCase());

      if (this.filter.Quantityfrom == null)
        this.filter.Quantityfrom = "";
      if (this.filter.QuantityTo == null)
        this.filter.QuantityTo = "";
      if (this.filter.PoDatefrom == null)
        this.filter.PoDatefrom = "";
      if (this.filter.PoDateTo == null)
        this.filter.PoDateTo = "";
      if (this.filter.AmountRangeFrom == null)
        this.filter.AmountRangeFrom = "";
      if (this.filter.AmountRangeTo == null)
        this.filter.AmountRangeTo = "";

        var con2 = true;
        if (this.filter.PoDatefrom != "" && this.filter.PoDateTo != "") {
          var sFrompodate = this.filter.PoDatefrom;
          var sTopodate = this.filter.PoDateTo;
          sFrompodate = this.datePipe.transform(this.filter.PoDatefrom, 'dd-MM-yy');
          sTopodate = this.datePipe.transform(this.filter.PoDateTo, 'dd-MM-yy');
          con2 = a.pODate >= sFrompodate && a.pODate <= sTopodate;
        }
        else if (this.filter.PoDatefrom != "") {
          var sFrompodate = this.filter.PoDatefrom;
          sFrompodate = this.datePipe.transform(this.filter.PoDatefrom, 'dd-MM-yy');
          con2 = a.pODate >= sFrompodate;
  
        }
        else if (this.filter.PoDateTo != "") {
          var sTopodate = this.filter.PoDateTo;
          sTopodate = this.datePipe.transform(this.filter.PoDateTo, 'dd-MM-yy');
          con2 = a.pODate <= sTopodate;
        }
  
        var con3 = true;
        if (this.filter.AmountRangeFrom != "" && this.filter.AmountRangeTo != "") {
          var fpoamt = parseInt(a.amount);
          var samtfrom = parseInt(this.filter.AmountRangeFrom);
          var samtto = parseInt(this.filter.AmountRangeTo);
          con3 = fpoamt >= samtfrom && fpoamt <= samtto;
        }
        else if (this.filter.AmountRangeFrom != "") {
          var fpoamt = parseInt(a.amount);
          var samtfrom = parseInt(this.filter.AmountRangeFrom);
          con3 = fpoamt >= samtfrom;
  
        }
        else if (this.filter.AmountRangeTo != "") {
          var fpoamt = parseInt(a.amount);
          var samtto = parseInt(this.filter.AmountRangeTo);
          con3 = fpoamt <= samtto;
        }

      var con4 = true;
      if (this.filter.Quantityfrom != "" && this.filter.QuantityTo != "" )  {
        var fpoqty = parseInt(a.quantity);
        var sQtyfrom = parseInt(this.filter.Quantityfrom);
        var sQtyto = parseInt(this.filter.QuantityTo);
        con4 = fpoqty >= sQtyfrom && fpoqty <= sQtyto;
      }
      else if (this.filter.Quantityfrom != "" ) {
        var fpoqty = parseInt(a.quantity);
        var sQtyfrom = parseInt(this.filter.Quantityfrom);
        con4 = fpoqty >= sQtyfrom;

      }
      else if (this.filter.QuantityTo != "" ) {
        var fpoqty = parseInt(a.quantity);
        var sQtyto = parseInt(this.filter.sQtyto);
        con4 = fpoqty <= sQtyto;
      }


      return con1 && con2 && con3 && con4;

    });
  }

}
