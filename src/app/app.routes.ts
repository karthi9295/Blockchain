import { Routes,RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';


import { AppComponent } from './app.component';
import { BiddingInfoComponent } from './bidding-info/bidding-info.component';
import { LoginComponent } from './login/login.component';
import { HomepageComponent } from './homepage/homepage.component';
import { RicohHomepageComponent } from './ricoh-homepage/ricoh-homepage.component';
import { LessorDataComponent } from './lessor-data/lessor-data.component';

export const routes:Routes = [

{path:'login', component:LoginComponent},
{path:'homescreen', component:RicohHomepageComponent},
{path:'search' , component:HomepageComponent},
{path:'bidding-info' , component:BiddingInfoComponent},
{path:'lessordata',component:LessorDataComponent},
//{path:'**' , component:LoginComponent}
{path:'**',redirectTo:'/login',pathMatch:'full'}

]
export const routing: ModuleWithProviders = RouterModule.forRoot(routes);