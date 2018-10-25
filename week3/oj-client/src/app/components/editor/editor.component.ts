import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { CollaborationService } from '../../services/collaboration.service';
import { DataService } from '../../services/data.service';

declare var ace: any; 

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
	editor: any;
  sessionId: string;
	public languages: string[] = ['Java', 'Python'];
	language: string = 'Java';
  output:string = ''; //for build and run output
  users :string = '';

	defaultContent = {
		'Java': `public class Example{
			public static void main(String[] args) {
				//Type your java code here
			}
		}
		`,
		'Python': `class Solution:
		def example():
			#write your Python code here.`
	};

  constructor(private collaboration: CollaborationService,
    private route: ActivatedRoute,
    private dataService: DataService) { }

  ngOnInit() {
    this.route.params
      .subscribe(params => {
        this.sessionId = params['id'];
        this.initEditor();
      });
    //restore buffer from backend
    this.collaboration.restoreBuffer();
  }

  initEditor(): void {
  	this.editor = ace.edit("editor");
  	this.editor.setTheme("ace/theme/eclipse");
//    this.editor.setValue(this.defaultContent['Java']);
  	this.resetEditor();
    document.getElementsByTagName('textarea')[0].focus();

    //set up collaboration socket
    this.collaboration.init(this.editor, this.sessionId)
      .subscribe(users => this.users = users);
    this.editor.lastAppliedChange = null;

    //register change callback
    this.editor.on('change', (e) => {
      console.log('editor changes: ' + JSON.stringify(e));

      // check if the change is same as last change,
      // if they are the same, skip this change
      if (this.editor.lastAppliedChange != e) {
        this.collaboration.change(JSON.stringify(e));
      }

    })
  }

  resetEditor(): void {
  	this.editor.getSession().setMode("ace/mode/" + this.language.toLowerCase());
  	this.editor.setValue(this.defaultContent[this.language]);
  }

  setLanguage(language: string): void {
  	this.language =language;
  	this.resetEditor();
  }

  submit(): void {
  	let usercode = this.editor.getValue();
  	console.log(usercode);

    //create object that contains user's code and language
    //send this to server
    const data ={
      code: usercode,
      lang: this.language.toLowerCase()
    };
    //buildAndRun return Promise
    this.dataService.buildAndRun(data).then(res => this.output = res);
  }

}
