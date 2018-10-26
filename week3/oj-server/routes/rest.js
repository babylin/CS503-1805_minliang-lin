const express = require ('express');
const router = express.Router();
const bodyParser = require ('body-parser');
const jsonParser =bodyParser.json();

const problemService = require('../services/problemService');

const nodeRestClient = require('node-rest-client').Client;

//create a instance for server to call the RESTful API
const restClient = new nodeRestClient();

//Python Flask server listen on port 5000 by default
EXECUTOR_SERVER_URL = 'http://localhost:5000/build_and_run';

//register a method
restClient.registerMethod('build_and_run', EXECUTOR_SERVER_URL, 'POST');

// get all problems
router.get('/problems', (req, res) => {
	problemService.getProblems()
	.then(problems => res.json(problems));
});

//get single problem
router.get('/problems/:id', (req, res) => {
	const id = req.params.id;
	problemService.getProblem(+id)
		.then(problem => res.json(problem));
});

//add a problem
router.post('/problems', jsonParser, (req, res) => {
	problemService.addProblem(req.body)
		.then(problem => {
			res.json(problem);
		}, error => {
			res.status(400).send('Problem name already exists!');
		});
});

//jsonParser:middleware, used to parse the body of the POST request
router.post('/build_and_run', jsonParser, (req, res) => {
	const code = req.body.code;
	const lang = req.body.lang;
	console.log('lang: ', lang, 'code: ', code);

	//this is the method we registered before, 
	restClient.methods.build_and_run(
	{
		data: {code: code, lang: lang},
		headers: {'Content-Type': 'application/json'}
	},
	(data, response) =>{
		//response: raw data, data:parsed response
		const text = `Build output: ${data['build']}, execute output: ${data['run']}`;
		res.json(text);
	}
	)
})

module.exports = router;