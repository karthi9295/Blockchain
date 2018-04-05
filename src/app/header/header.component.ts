import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  
  userdetails: any;
  constructor(private router: Router) {
    this.userdetails = JSON.parse(localStorage.getItem("userdetails"));
  }
  ngOnInit() {
  }
  
  home(){
    this.router.navigate(['/homescreen']);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}