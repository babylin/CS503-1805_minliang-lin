import { Component, OnInit } from '@angular/core';
declare var ace: any; 

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
	editor: any;
	public languages: string[] = ['Java', 'Python'];
	language: string = 'Java';
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

  constructor() { }

  ngOnInit() {
  	this.editor = ace.edit("editor");
  	this.editor.setTheme("ace/theme/eclipse");
  	this.resetEditor();
  }

  resetEditor(): void {
  	this.editor.getSession().setMode("ace/mode/" + this.language.toLowerCase());
  	this.editor.setValue(this.language);
  }

  setLanguage(language: string): void {
  	this.language =language;
  	this.resetEditor();
  }

  submit(): void {
  	let usercode = this.editor.getValue();
  	console.log(usercode);
  }

}
