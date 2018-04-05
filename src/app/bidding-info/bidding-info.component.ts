import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HomepageComponent } from '../homepage/homepage.component';
import { SearchService } from '../Service/search.service'
import { Router, ActivatedRoute } from '@angular/router';

declare const $: any;

@Component({
  selector: 'app-bidding-info',
  templateUrl: './bidding-info.component.html',
  styleUrls: ['./bidding-info.component.css'],
  providers: [SearchService]
})



export class BiddingInfoComponent implements OnInit {
  Biddinginfo:any;
  Biddinginfo1:any;
  selectrowindex:number;
  selectrow:any;
  searchDeatilsData:any;
  userdetails:any;
  model: any;
  filename= "";
  filetype= "";
  filevalue= "";
  lessor1ROI= "";
  lessor2ROI= "";

  constructor(private searchservice: SearchService,private router: Router,) {
    this.selectrowindex = -1;
    this.userdetails = JSON.parse(localStorage.getItem("userdetails"));
    this.Biddinginfo = JSON.parse(localStorage.getItem("biddinginfo"));
    this.Biddinginfo1 = JSON.parse(localStorage.getItem("biddinginfo"));
    this.selectrow = { eventID: "", itemCode: "", customerName: "", quantity: "", pONumber: "", sOrder: "", amount: "", lessor1ROI: "", lessor2ROI: "", }
    this.model = {extraNote: ""};
  }

  ngOnInit() {


  }
  selectedRad(index) {
    debugger;
    this.selectrowindex = index;
   
  }

  saveBankDetails() {
    debugger;
    this.Biddinginfo["lessor1ROI"] = String(this.Biddinginfo.lessor1ROI) ;
    this.Biddinginfo["lessor2ROI"] = String(this.Biddinginfo.lessor2ROI);
    this.Biddinginfo1["lessor1ROI"] = String(this.Biddinginfo.lessor1ROI) ;
    this.Biddinginfo1["lessor2ROI"] = String(this.Biddinginfo.lessor2ROI);

    if (this.userdetails.userName == 'bank1')
    {
      if ((this.Biddinginfo["lessor1ROI"] == "" || this.filename == "")) {
        $('#ROIPopoup').modal('show');
        return;
      }
      this.Biddinginfo["lessor1"] = "BS";
      this.Biddinginfo["lessor1FileName"] = this.filename;
      this.Biddinginfo["lessor1FileExt"] =  this.filetype;
    }
      
    if (this.userdetails.userName == 'bank2'){
      if ( (this.Biddinginfo["lessor2ROI"] == "" || this.filename == "")) {
        $('#ROIPopoup').modal('show');
        return;
      } 
      this.Biddinginfo["lessor2"] = "BS";
      this.Biddinginfo["lessor2FileName"] = this.filename;
      this.Biddinginfo["lessor2FileExt"] =  this.filetype;
    }
    this.searchservice.savePO(this.Biddinginfo).subscribe(data => {
      //  this.search();
        if (this.filename != null && this.filename != "")
        {
          this.onFileSubmit();
        }
        debugger;
      });
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
    eventid:this.Biddinginfo["eventID"],
    filename:this.filename,
    contents:this.filevalue,
   }
    this.searchservice.saveFile(data).subscribe(data => {
      debugger;
    });;
}


  contract(){
    debugger;
    if (this.selectrowindex == -1) {
      $('#selectanyPO').modal('show');
      return;
    }
    else if(this.Biddinginfo["status"] == "Auction Completed") {
      $('#alreadySubmitted').modal('show');
    }
    else {
      $('#finalPopup').modal('show');
  } 
}

submitWithout(){
  debugger;
    this.searchservice.submitWithoutMsg(this.model.extraNote).subscribe(data => {
      debugger;
});
if(this.selectrowindex == 1 && this.Biddinginfo["status"] == "Auction In Progress"){
  this.Biddinginfo["lessor1"] = "CA";
  this.Biddinginfo["status"] = "Auction Completed";
}
else if(this.selectrowindex == 2 && this.Biddinginfo["status"] == "Auction In Progress"){
  this.Biddinginfo["lessor2"] = "CA";
  this.Biddinginfo["status"] = "Auction Completed";
}
this.searchservice.savePO(this.Biddinginfo).subscribe(data => {
  debugger;
});
}

}
