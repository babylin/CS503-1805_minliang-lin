import { Injectable } from '@angular/core';
// import { Problem } from '../models/problem.model';
// import { PROBLEMS } from '../monk-problems';
import { HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject} from 'rxjs';

import { Problem } from '../models/problem.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
	//a list of problems
	// problems: Problem[] = PROBLEMS;
  private _problemSource = new BehaviorSubject<Problem[]>([]);


  constructor(private httpClient: HttpClient) { }

  //return a list of problems
  // getProblems(): Problem[] {
  // 	return this.problems;
  // }

  // //input a id, return the problem with that id 
  // getProblem(id: number): Problem {
  // 	return this.problems.find( (problem) => problem.id === id );
  // }

  // addProblem(problem: Problem ){
  	
  // }

  getProblems(): Observable<Problem[]> {
    this.httpClient.get('api/v1/problems')
      .toPromise()
      .then((res: any) => {
        this._problemSource.next(res);
      })
      .catch(this.handleError);
     return this._problemSource.asObservable();
  } 

  getProblem(id: number): Promise<Problem> {
    return this.httpClient.get(`api/v1/problems/${id}`)
      .toPromise()
      .then((res: any) => res)
      .catch(this.handleError);
  }

  addProblem(problem: Problem) {
    const options = {headers: new HttpHeaders({ 'Content-Type': 'application/json'})};
    return this.httpClient.post('api/v1/problems',problem, options)
      .toPromise()
      .then((res: any) => {
        this.getProblems();

        return res;
      })
      .catch(this.handleError);

  }
  private handleError(error: any): Promise<any> {
    return Promise.reject(error.body || error);
  }
}

