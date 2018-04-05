import { Component, OnInit, Injectable, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { ApplicationSettings } from '../application-settings';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, FormControl, FormGroup  } from '@angular/forms';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { searchDetails, searchDeatilsData, searchDetailsInputParam } from '../Interfaces/interface';
import { WebsocketService } from '../Service/websocket.service';
import { CommonserviceService } from '../Service/commonservice.service';
import { SearchService } from '../Service/search.service'
import { debounce } from 'rxjs/operators/debounce';
import 'rxjs/add/operator/map';
import { DatePipe } from '@angular/common'
import { concat } from 'rxjs/observable/concat';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { timer } from 'rxjs/observable/timer';
import { take, map } from 'rxjs/operators';
import { Config } from "ngx-countdown";

declare const require: any;
declare const $: any;

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
  providers: [SearchService, WebsocketService, CommonserviceService, DatePipe]
})


export class HomepageComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;

  myFile: any;
  btncaption: string;
  model: any = {};
  sub: Subscription;
  searchDeatilsData: any;
  searchDeatilsOriData: any;
  data: any;
  searchdetails: any;
  statuslist: any;
  selectrowindex: number;
  userdetails: any;
  selectrow: any;
  filter: any;
  todayDate = new Date();
  closeResult: string;
  today = new Date().toJSON().split('T')[0];

  filename= "";
  filetype= "";
  filevalue= "";

  constructor(private route: ActivatedRoute,
    private modalService: NgbModal,
    private datePipe: DatePipe,
    private router: Router,
    private searchservice: SearchService,
    private wsCommonService: CommonserviceService) {
    this.statuslist = ["Create Auction Proposal"];
    this.selectrowindex = -1;
    this.userdetails = JSON.parse(localStorage.getItem("userdetails"));
    this.selectrow = { eventID: "", itemCode: "", customerName: "", quantity: "", pONumber: "", sOrder: "", amount: "", lessor1ROI: "", lessor2ROI: "", }
    this.filter = {
      CustomerName: "", PoDatefrom: "", PoDateTo: "", ItemCode: "", RejectionDateFrom: "", RejectionDateTo: "", PoNumber: "", Quantityfrom: "",
      QuantityTo: "", EventID: "", AmountRangeFrom: "", AmountRangeTo: "", Item: "", salesOrder: "", Status: ""
    };
  }

  ngOnInit() {
    this.loadPo();
  }

  search() {
    debugger;
    this.searchDeatilsData = this.searchDeatilsOriData.filter(a => {
      var con1 = (this.filter.CustomerName == "" || a.customerName.toLowerCase().indexOf(this.filter.CustomerName.toLowerCase()) > -1)
        && (this.filter.ItemCode == "" || a.itemCode.toLowerCase().indexOf(this.filter.ItemCode.toLowerCase()) > -1)
        && (this.filter.PoNumber == "" || a.pONumber.toLowerCase().indexOf(this.filter.PoNumber.toLowerCase()) > -1)
        && (this.filter.EventID == "" || a.eventID.toLowerCase().indexOf(this.filter.EventID.toLowerCase()) > -1)
        && (this.filter.Item == "" || a.itemDesc.toLowerCase().indexOf(this.filter.Item.toLowerCase()) > -1)
        && (this.filter.salesOrder == "" || a.sOrder.toLowerCase().indexOf(this.filter.Item.toLowerCase()) > -1)
        && (this.filter.Status == "" || a.status.toLowerCase() == this.filter.Status.toLowerCase());

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
        //var fpodate = new Date(a.pODate);
        // var ddmmyyyy = a.pODate.split('-');
        // var sFrompodate = new Date(this.filter.PoDatefrom);
        // var sTopodate = new Date(this.filter.PoDateTo);
        //var sFrompodate = this.datePipe.transform(this.filter.PoDatefrom, 'dd-MM-yy');
        //var sTopodate = this.datePipe.transform(this.filter.PoDateTo, 'dd-MM-yy');
        var sFrompodate = this.filter.PoDatefrom;
        var sTopodate = this.filter.PoDateTo;
        sFrompodate = this.datePipe.transform(this.filter.PoDatefrom, 'dd-MM-yy');
        sTopodate = this.datePipe.transform(this.filter.PoDateTo, 'dd-MM-yy');
        con2 = a.pODate >= sFrompodate && a.pODate <= sTopodate;
      }
      else if (this.filter.PoDatefrom != "") {
        //var fpodate = new Date(a.pODate);
        var sFrompodate = this.filter.PoDatefrom;
        sFrompodate = this.datePipe.transform(this.filter.PoDatefrom, 'dd-MM-yy');
        con2 = a.pODate >= sFrompodate;

      }
      else if (this.filter.PoDateTo != "") {
        //var fpodate = new Date(a.pODate);
        //a.pODate = this.datePipe.transform(a.pODate, 'yyyy-MM-dd');
        var sTopodate = this.filter.PoDateTo;
        sTopodate = this.datePipe.transform(this.filter.PoDateTo, 'dd-MM-yy');
        con2 = a.pODate <= sTopodate;
      }

      // var con3 = true;
      // if (this.filter.RejectionDateFrom != "" && this.filter.RejectionDateTo != "") {
      //   //var fpodate = new Date(a.rejectDate);
      //   //var sFrompodate = new Date(this.filter.RejectionDateFrom);
      //   //var sTopodate = new Date(this.filter.RejectionDateTo);
      //   var sFrompodate = this.filter.RejectionDateFrom;
      //   var sTopodate = this.filter.RejectionDateTo;
      //   a.rejectDate = this.datePipe.transform(a.rejectDate, 'yyyy-dd-MM');
      //   con3 = a.rejectDate >= sFrompodate && a.rejectDate <= sTopodate;
      // }
      // else if (this.filter.RejectionDateFrom != "") {
      //   //var fpodate = new Date(a.rejectDate);
      //   var sFrompodate = this.filter.RejectionDateFrom;
      //   a.rejectDate = this.datePipe.transform(a.rejectDate, 'yyyy-dd-MM');
      //   con3 = a.rejectDate >= sFrompodate;

      // }
      // else if (this.filter.RejectionDateTo != "") {
      //   //var fpodate = new Date(a.rejectDate);
      //   var sTopodate = this.filter.RejectionDateTo;
      //   a.rejectDate = this.datePipe.transform(a.rejectDate, 'yyyy-dd-MM');
      //   con3 = a.rejectDate <= sTopodate;
      // }
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
      if (this.filter.Quantityfrom != "" && this.filter.QuantityTo != "") {
        var fpoqty = parseInt(a.quantity);
        var sQtyfrom = parseInt(this.filter.Quantityfrom);
        var sQtyto = parseInt(this.filter.QuantityTo);
        con4 = fpoqty >= sQtyfrom && fpoqty <= sQtyto;
      }
      else if (this.filter.Quantityfrom != "") {
        var fpoqty = parseInt(a.quantity);
        var sQtyfrom = parseInt(this.filter.Quantityfrom);
        con4 = fpoqty >= sQtyfrom;

      }
      else if (this.filter.QuantityTo != "") {
        var fpoqty = parseInt(a.quantity);
        var sQtyto = parseInt(this.filter.QuantityTo);
        con4 = fpoqty <= sQtyto;
      }



      return con1 && con2 && con3 && con4;

    });
  }


  countConfig(leftTime) {

    return {
      leftTime: leftTime,
      className: 'flip-cd',
      repaint: function () {
        let me: any = this,
          content: string;

        me.hands.forEach((hand: any) => {
          if (hand.lastValue !== hand.value) {
            content = '';
            let cur = me.toDigitals(hand.value , hand.bits).join(''),
              next = me.toDigitals(hand.value, hand.bits).join('');

            hand.node.innerHTML = `
                    <span class="count curr top">${cur}</span> `;
            hand.node.parentElement.className = 'time';
            setTimeout(() => {
              hand.node.parentElement.className = 'time flip';
            });
          }
        });
      }
    }
  }





  loadPo() {
    this.searchservice.search(this.model.custname, this.model.ponum).subscribe(data => {
      var userdetails = JSON.parse(localStorage.getItem("userdetails"));

      /*if(userdetails.role == "Ricoh" && this.searchDeatilsData.filter(a => a.status =='Pending Initiation')){
        this.btncaption ="Create Auction Proposal";
      }
      /*else if(userdetails.role == "Customer" && this.searchDeatilsData.status=='Proposal Created'){
        this.btncaption ="Accept Proposal";
      }
      else if(userdetails.role == "Customer" && this.searchDeatilsData.status=='Bid Submission'){
        this.btncaption ="Bid Selection";
      }
      else if(userdetails.role == "Bank" && this.searchDeatilsData.status=='Proposal Accepted' && userdetails.userName == "bank1" && this.searchDeatilsData.lessor1 != "BS"){
        this.btncaption ="Bid Submission";
      }
      else if(userdetails.role == "Bank" && this.searchDeatilsData.status=='Proposal Accepted' && userdetails.userName == "bank2" && this.searchDeatilsData.lessor2 != "BS"){
        this.btncaption ="Bid Submission";
      }
*/
      this.searchDeatilsData = data;
      if (userdetails.role == "Customer") {
        debugger;
        this.searchDeatilsData = this.searchDeatilsData.filter(a => a.customerID == userdetails.userID && (a.status == "Create Auction Proposal" || a.status == "Auction In Progress" || a.status == "Need Information"  || a.status == "View Auction Proposal" || a.status == "Rejected for Auction"));
        this.statuslist = ["Auction In Progress"];
      }
      else if (userdetails.role == "Bank" && userdetails.userName == "bank1") {
        this.searchDeatilsData = this.searchDeatilsData.filter(a => {
          debugger;
          return ((a.status == "View Auction Proposal" || a.status == "Auction In Progress")) //&& (a.lessor1 != "BS"))

        });
        this.statuslist = ["Auction In Progress"];
      }
      else if (userdetails.role == "Bank" && userdetails.userName == "bank2") {
        this.searchDeatilsData = this.searchDeatilsData.filter(a => (a.status == "View Auction Proposal" || a.status == "Auction In Progress")) //&& (a.lessor2 != "BS"));
        this.statuslist = ["Auction In Progress"];
      }
      else if (userdetails.role == "Ricoh") {
        this.searchDeatilsData = this.searchDeatilsData.filter(a => a.status != "Auction Completed");
      }

      this.searchDeatilsData.forEach(element => {
        if (userdetails.role == "Bank" && userdetails.userName == "bank1") {
          debugger;
          element["currentstatus"] = element["status"];
          element["status"] = (element["lessor1"] == "BS") ? "Auction In Progress" : (element["lessor1"] == "CA") ? "Auction Completed" : "Auction In Progress";
        }
        else if (userdetails.role == "Bank" && userdetails.userName == "bank2") {
          element["status"] = (element["lessor2"] == "BS") ? "Auction In Progress" : (element["lessor2"] == "CA") ? "Auction Completed" : "Auction In Progress";
        }
        element["selectValue"] = "Create Auction Proposal";
        debugger;
        let currentdate = new Date();
        let createdate = this.addDays(new Date(element["createdDate"]), 6);
        let bitdays = createdate.getTime() - currentdate.getTime();
        element["timecount"] = this.countConfig(bitdays / 1000);

      });

      this.searchDeatilsOriData = this.searchDeatilsData;
    });

  }

  addDays(theDate, days) {
    return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
  }

  selectedRad(index) {
    this.selectrowindex = index;
    this.selectrow = this.searchDeatilsData[this.selectrowindex];
  }

  saveStatus(item, status) {
    debugger;
    item["selectValue"] = status;
    if (this.selectrowindex == -1) {
      $('#selectanyPO').modal('show');
      return;
    }
    /*if (this.searchDeatilsData[this.selectrowindex]["selectValue"] == "Choose...") {
      alert("Please select the action")
      return;
    }*/
    if ((this.userdetails.role == "Bank") && (this.searchDeatilsData[this.selectrowindex]["timecount"]["leftTime"] > 0)) {
      //$('#mdlpopup').modal('show');
      localStorage.setItem('biddinginfo', JSON.stringify(this.searchDeatilsData[this.selectrowindex]));
      this.router.navigate(['/bidding-info']);
      return;
    }
    else if ((this.userdetails.role == "Customer") && (this.searchDeatilsData[this.selectrowindex]["status"] == "Create Auction Proposal") && (isNaN(this.searchDeatilsData[this.selectrowindex]["timecount"]["leftTime"]))) {
      $("#custPopup").modal('show');
      return;
    }
    else if ((this.userdetails.role == "Customer") && (this.searchDeatilsData[this.selectrowindex]["status"] == "Auction In Progress") && (this.searchDeatilsData[this.selectrowindex]["timecount"]["leftTime"] > 0)) {
      localStorage.setItem('biddinginfo', JSON.stringify(this.searchDeatilsData[this.selectrowindex]));
      this.router.navigate(['/bidding-info']);
      /*if (this.searchDeatilsData[this.selectrowindex]["currentstatus"] != "Contract Created")
      {
        this.router.navigate(['/bidding-info']);
      }
      else{
        alert("");
      }*/

      return;
    }
    else if ((this.userdetails.role == "Customer" || this.userdetails.role == "Bank") && (this.searchDeatilsData[this.selectrowindex]["timecount"]["leftTime"] <= 0)) {
      $('#biddingOver').modal('show');
      return;
    }
    else if ((this.userdetails.role == "Customer") && (this.searchDeatilsData[this.selectrowindex]["status"] == "Create Auction Proposal")) {
      return;
    }
    else if ((this.userdetails.role == "Customer") && (this.searchDeatilsData[this.selectrowindex]["status"] == "Auction In Progress")) {
      return;
    }
    else if ((this.userdetails.role == "Ricoh") && (this.searchDeatilsData[this.selectrowindex]["status"] != "Pending Initiation")) {
      //alert("PO has been already Created/Rejected");
      return;
    }
    else if (this.userdetails.role == "Ricoh") {
      $('#ricohPopup').modal('show');
    }
    this.saveDetails();
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


  saveCustDetails(item, status) {
    this.searchDeatilsData[this.selectrowindex]["createdDate"] = new Date().toLocaleString();
    this.searchDeatilsData[this.selectrowindex]["timecount"] = this.countConfig(7 * 24 * 60 * 60);
    this.saveDetails();
  }

  rejectProposal(item, status) {
    debugger;
    this.searchDeatilsData[this.selectrowindex]["status"] = this.searchDeatilsData[this.selectrowindex]["selectValue"];
    if (this.searchDeatilsData[this.selectrowindex]["status"] == "Auction In Progress") {
      this.searchDeatilsData[this.selectrowindex]["status"] = "Rejected for Auction";
    }
    this.searchservice.savePO(this.searchDeatilsData[this.selectrowindex]).subscribe(data => {
      debugger;
    });
  }
  saveBankDetails() {
    this.searchDeatilsData[this.selectrowindex]["lessor1ROI"] = String(this.selectrow.lessor1ROI) ;
    this.searchDeatilsData[this.selectrowindex]["lessor2ROI"] = String(this.selectrow.lessor2ROI);

    if (this.userdetails.userName == 'bank1')
    {
      if ((this.searchDeatilsData[this.selectrowindex]["lessor1ROI"] == "" || this.filename == "")) {
        $('#ROIPopoup').modal('show');
        return;
      }
      this.searchDeatilsData[this.selectrowindex]["lessor1"] = "BS";
      this.searchDeatilsData[this.selectrowindex]["lessor1FileName"] = this.filename;
      this.searchDeatilsData[this.selectrowindex]["lessor1FileExt"] =  this.filetype;
    }
      


    if (this.userdetails.userName == 'bank2'){
      if ( (this.searchDeatilsData[this.selectrowindex]["lessor2ROI"] == "" || this.filename == "")) {
        $('#ROIPopoup').modal('show');
        return;
      } 

      this.searchDeatilsData[this.selectrowindex]["lessor2"] = "BS";
      this.searchDeatilsData[this.selectrowindex]["lessor2FileName"] = this.filename;
      this.searchDeatilsData[this.selectrowindex]["lessor2FileExt"] =  this.filetype;

      
    }


    this.saveDetails();
  }

  infoNeeded(item, status) {
    debugger;
    this.searchservice.SendNeedInformation().subscribe(data => {

    });
    this.searchDeatilsData[this.selectrowindex]["status"] = this.searchDeatilsData[this.selectrowindex]["selectValue"];
    if (this.searchDeatilsData[this.selectrowindex]["status"] == "Auction In Progress") {
      this.searchDeatilsData[this.selectrowindex]["status"] = "Need Information";
    }
    this.searchservice.savePO(this.searchDeatilsData[this.selectrowindex]).subscribe(data => {
    debugger;
  });
  $('#mailSuccess').modal('show');
}

  openDts() {
    debugger;
    this.selectrow = this.searchDeatilsData[this.selectrowindex];
    $('#bankbidPopup').modal('show');
    $("button[data-dismiss-modal=modal2]").click(function () {
      $('#bankbidPopup').modal('hide');
    });
    return;
  }
  saveDetails() {
    debugger;
    if (this.searchDeatilsData[this.selectrowindex]["status"] == "Pending Initiation") {
      this.searchDeatilsData[this.selectrowindex]["eventID"] = this.guid();

    }

    this.searchDeatilsData[this.selectrowindex]["status"] = this.searchDeatilsData[this.selectrowindex]["selectValue"];
    this.searchservice.savePO(this.searchDeatilsData[this.selectrowindex]).subscribe(data => {
    //  this.search();
      if (this.filename != null && this.filename != "")
      {
        this.onFileSubmit();
      }
      debugger;
    });
  }

  guid() {
    return "" + Math.floor(Math.random() * 9000);
  }

  onFileChange(event: any) { 
    let reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      debugger;
     
      reader.onload = data => {
         this.filevalue= reader.result.split(',')[1];
         this.filename= file.name;
         this.filetype= file.type;
      };
    }   
    //this.myFile = files.item(0);    
  }

  onFileSubmit(): void {
   var data ={
    eventid:this.searchDeatilsData[this.selectrowindex]["eventID"],
    filename:this.filename,
    contents:this.filevalue,
   }
    this.searchservice.saveFile(data).subscribe(data => {
      debugger;
    });;
}

  /*searchDataList(searchDeatilsData) {
    if (searchDeatilsData.Customername==null || searchDeatilsData.Customername=="")
    {
        alert("Please provide details");
        return;
    }
    else{
      debugger;
      localStorage.setItem('searchdetails', JSON.stringify(searchDeatilsData));
      localStorage.getItem(JSON.parse(searchDeatilsData));
      this.searchDeatilsData = searchDeatilsData.data;
      console.log(searchDeatilsData);
        //this.searchDeatilsData = JSON.stringify(searchDeatilsData.data);
           
    }
  }*/


}
