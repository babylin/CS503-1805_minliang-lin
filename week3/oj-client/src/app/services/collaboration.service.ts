import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

declare var io: any;

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {
	collaborationSocket: any;
  private _userSource = new Subject<string>();

  constructor() { }

  init(editor: any, sessionId: string): Observable<string> {
  	this.collaborationSocket = io(window.location.origin, { query: 'sessionId=' + sessionId});
  	// this.collaborationSocket.on('message', (message) => {
  	// 	console.log('message receive from server: ' + message);
  	// });

    //when receive change from the server, apply to local browser session
  	this.collaborationSocket.on('change', (delta: string) => {
  		console.log('collaboration: editor changes ' + delta);
  		delta = JSON.parse(delta);
  		editor.lastAppliedChange = delta;
  		editor.getSession().getDocument().applyDeltas([delta]);
  	});
    this.collaborationSocket.on('userChange', (data: string[]) => {
      console.log('collaboration user change: ' + data);
      this._userSource.next(data.toString());
    });
    return this._userSource.asObservable();
  }

  change(delta: string): void {
  	//emit 'change' event
  	console.log('send message' + delta);
  	this.collaborationSocket.emit('change', delta);
  }


  //restore buffer from redis cache
  restoreBuffer(): void {
    //emit "restoreBuffer" event
    //let sever to handle this event
    this.collaborationSocket.emit("restoreBuffer");
  }

}
