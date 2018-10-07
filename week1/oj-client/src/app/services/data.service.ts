import { Injectable } from '@angular/core';
import { Problem } from '../models/problem.model';
import { PROBLEMS } from '../monk-problems';

@Injectable({
  providedIn: 'root'
})
export class DataService {
	//a list of problems
	problems: Problem[] = PROBLEMS;


  constructor() { }
  //return a list of problems
  getProblems(): Problem[] {
  	return this.problems;
  }

  //input a id, return the problem with that id 
  getProblem(id: number): Problem {
  	return this.problems.find( (problem) => problem.id === id );
  }

  addProblem(problem: Problem ){
  	
  }

}
