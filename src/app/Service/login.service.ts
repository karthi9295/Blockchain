import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { ApplicationSettings } from '../application-settings';

@Injectable()
export class LoginService {

  constructor(private httpclient: HttpClient) { }
 
  LoginService(username:string,password:string){
    let url =ApplicationSettings.ServerURL+ 'api/login';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let userdata = {username:username,password:password};
    return this.httpclient.post(url,userdata);
               
  }
  LogoutUser(){
    let url =ApplicationSettings.ServerURL+ 'logoutUser';
    return  this.httpclient.post(url,{});
  }
  handleError(error:Response){
    console.log(error);
    return Observable.throw(error);
}
}