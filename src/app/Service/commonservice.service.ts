import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';
import { WebsocketService } from './websocket.service';
import { UserDetails,UserDetailsData } from '../Interfaces/interface';
//import { CommonService } from './commonservice.service';

const CHAT_URL = 'ws://172.25.140.95:3001/';

@Injectable()
export class CommonserviceService {
	public userdetails: Subject<UserDetailsData>;

	constructor(private wsservice:WebsocketService) {

		// this.userdetails = <Subject<UserDetailsData>>wsservice
		// 	.connect(CHAT_URL)
		// 	.map((response: MessageEvent): UserDetailsData => {
		// 		let data = JSON.parse(response.data);
		// 		return {
		// 			Key: data.Key,
		// 			InputParam: data.InputParam,
		// 			Output: data.Output
		// 		}
		// 	});
    }
}
