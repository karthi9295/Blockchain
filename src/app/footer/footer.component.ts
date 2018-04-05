import { Component, OnInit } from '@angular/core';
import { WSCommonService } from 'app/Service/commonws.service';
import { WebsocketService } from 'app/Service/websocket.service';
import { trigger, state, style, transition, animate, sequence } from '@angular/animations';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  providers: [WebsocketService, WSCommonService],
  styleUrls: ['./footer.component.css'],
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0)'})),
      transition('void => *', [
        style({transform: 'translateX(-100%)'}),
        animate(1000)
      ]),
      transition('* => void', [
        animate(100, style({transform: 'translateX(100%)'}))
      ])
    ]),
    trigger('roundAntiClockTrigger', [
      state('in', style({
          backgroundColor: '#E5E7E9',
          color: '#1B2172'
      })),  
        transition('void => *', sequence([
            style({
               transform: 'rotate(270deg)',
                 opacity: 0,
             backgroundColor: '#0D6063'
          }),
            animate('0.6s ease-in-out')
        ])),
        transition('* => void',[ 
          style({backgroundColor: '#0D6063'}),
            animate('0.6s ease-out', style({transform: 'rotate(-270deg)', opacity: 0}))
        ])
  ])
]
})
export class FooterComponent implements OnInit {
  state:"in";
  blocksUpdatedData: any;
  userdetails: any;
  constructor(private _assetService: WSCommonService) { 
    this.userdetails = JSON.parse(localStorage.getItem("userdetails"));
    this.blocksUpdatedData = [];
    console.log("footer constructor");
    _assetService.blocksUpdatedData.subscribe(msg => {
      console.log(msg);
      console.log("footer data");
      // msg.Output.forEach(x => {        
      //   this.blocksUpdatedData.push(x);
      //   var len= this.blocksUpdatedData.length;
      //   if (len>20)
      //   this.blocksUpdatedData= this.blocksUpdatedData.slice(len-10);
      // });
    });
  }

  ngOnInit() {
    setTimeout(() => {
     // this.loadBlockDetails();
    }, 100);
  }

 
}
