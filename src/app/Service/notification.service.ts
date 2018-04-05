import { ToastrService } from 'ngx-toastr';
import { Injectable, ViewContainerRef } from '@angular/core';
   
  
 @Injectable()
   export class NotificationService {
   
     constructor(private toastr: ToastrService) {
     }
   
     showError(errmsg:string) {
       this.toastr.error(errmsg, 'Oops!');
     }    
   
   }