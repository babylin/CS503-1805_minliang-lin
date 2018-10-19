import { Injectable } from '@angular/core';

declare var io: any;

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {
	collaborationSocket: any; 
  constructor() { }

  init(editor: any, sessionId: string): void {
  	this.collaborationSocket = io(window.location.origin, { query: 'sessionId=' + sessionId});
  	// this.collaborationSocket.on('message', (message) => {
  	// 	console.log('message receive from server: ' + message);
  	// });
  	this.collaborationSocket.on('change', (delta: string) => {
  		console.log('collaboration editor changes ' + delta);
  		delta = JSON.parse(delta);
  		editor.lastAppliedChange = delta;
  		editor.getSession().getDocument().applyDeltas([delta]);
  	});
  }

  change(delta: string): void {
  	//emit 'change' event
  	console.log('send message' + delta);
  	this.collaborationSocket.emit('change', delta);
  }

}
