import { Component, OnInit, Injectable } from '@angular/core';
import { ApplicationSettings } from '../application-settings';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Http, Headers, Response} from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { UserDetails, UserDetailsData, UserDetailsInputParam } from '../Interfaces/interface';
import { Observable } from 'rxjs';
import { LoginService } from '../Service/login.service';

import { WebsocketService } from '../Service/websocket.service';
import { CommonserviceService } from '../Service/commonservice.service';
import { Subscription } from 'rxjs/Subscription';
import { debounce } from 'rxjs/operators/debounce';
import { NotificationService } from '../Service/notification.service';
import 'rxjs/add/operator/map';

declare const require: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers:[LoginService,WebsocketService,CommonserviceService,NotificationService]
})

@Injectable()

export class LoginComponent implements OnInit {
model: any = {};
sub: Subscription;
public items:any;
userdetails: any;
result:any;

constructor(
   private _notificationService: NotificationService,
    private route: ActivatedRoute,
    private httpclient: HttpClient,
    private loginService:  LoginService,
    private router: Router,
    private wsCommonService: CommonserviceService) {

    //     this.sub = wsCommonService.userdetails.subscribe(msg => {
    //     this.loginSuccess(msg) 
    //     console.log("Response from websocket: " +JSON.stringify(msg) );
    // });
    this.result="";
}
  
ngOnInit() {
 
}

login() {
  debugger;
    this.loginService.LoginService(this.model.username,this.model.password).subscribe(data => {
    this.loginSuccess(data)/*JSON.parse(data["_body"])*/
  });
}

loginSuccess(userDetailsData) {
  this.result="";
  if (userDetailsData.userName==null || userDetailsData.userName=="")
  {
   // this._notificationService.showError("Invalid user creditials");
   this.result="Invalid user creditials";
     return;
  }
  else{
   
      localStorage.setItem('userdetails', JSON.stringify(userDetailsData));
      this.router.navigate(['/homescreen']);
  }
}

// ngOnDestroy() {
//  // this.sub.unsubscribe();
// } 

}