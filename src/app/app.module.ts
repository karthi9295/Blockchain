import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HttpModule} from '@angular/http';
import { AppComponent } from './app.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { HomepageComponent } from './homepage/homepage.component';
import { HeaderComponent } from './header/header.component';
import { RicohHomepageComponent } from './ricoh-homepage/ricoh-homepage.component';
import { FooterComponent } from './footer/footer.component';
import { BiddingInfoComponent } from './bidding-info/bidding-info.component';
import {Router} from  '@angular/router/src/router';
import { DatePipe } from '@angular/common'
import { routing } from './app.routes';
import { LoginComponent } from './login/login.component';
import { LoginService } from './Service/login.service';
import { WebsocketService } from './Service/websocket.service';
import { SearchService } from './Service/search.service';
import { CommonserviceService } from 'app/Service/commonservice.service';
import { LessorDataComponent } from './lessor-data/lessor-data.component';
import { ToastrModule } from 'ngx-toastr';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { CountdownModule } from 'ngx-countdown';

//import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
//import {CalendarModule} from 'primeng/calendar';

//import { SearchComponent } from './search/search.component';



@NgModule({ 
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    BiddingInfoComponent,
    LoginComponent,
    HomepageComponent,
    LessorDataComponent,
    RicohHomepageComponent
   
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    //JsonpModule,
    routing,
    //BrowserAnimationsModule,
    //CalendarModule,
    CountdownModule,
    NgbModule,
    NgbModule.forRoot(),
    ToastrModule.forRoot(),
    NgxPaginationModule
    
  ],
  providers: [LoginService,WebsocketService,SearchService,CommonserviceService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
