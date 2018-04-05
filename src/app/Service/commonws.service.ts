import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';
import { WebsocketService } from './websocket.service';

const CHAT_URL = 'ws://172.25.140.95:3001/';

@Injectable()
export class WSCommonService {
	public blocksUpdatedData: Subject<any>;

	constructor(wsService: WebsocketService) {
			this.blocksUpdatedData = <Subject<any>>wsService
			.connect(CHAT_URL)
			.map((response: MessageEvent): any => {
				let data = JSON.parse(response.data);
				return data;
			});


	}
}


