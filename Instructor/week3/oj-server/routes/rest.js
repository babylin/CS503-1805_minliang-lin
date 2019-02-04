const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const problemService = require('../services/problemService');

const nodeRestClient = require('node-rest-client').Client;

const restClient = new nodeRestClient()

// executor
EXECUTOR_SERVER_URL = 'http://executor/build_and_run';

restClient.registerMethod('build_and_run', EXECUTOR_SERVER_URL, 'POST');

// get all problems
router.get('/problems', (req, res) => {
	problemService.getProblems()
		.then((problems) => {
			res.json(problems)});
});

// get single problem
router.get('/problems/:id', (req, res) => {
	const id = req.params.id;
	problemService.getProblem(+id)
		.then(problem => res.json(problem));
});

// add a problem
router.post('/problems', jsonParser, (req, res) => {
	problemService.addProblem(req.body)
		.then(problem => {
			res.json(problem);
		}, error => {
			res.status(400).send('Problem name already exists!');
		});
});

// modify a problem
router.put('/problems', jsonParser, (req, res) => {
	problemService.modifyProblem(req.body)
		.then(problem => {
			res.json(problem);
		}, error => {
			res.status(400).send('Failed to update problem');
		});
})

// this build_and_run was requeted from oj-client, req = request from oj-client
// res = response to oj-client
router.post('/build_and_run', jsonParser, (req, res) => {
	const code = req.body.code;
	const lang = req.body.lang;

	console.log('lang: ', lang, 'code: ', code);

	// this build_and_run is an API on executor
	restClient.methods.build_and_run(
	{
		data: {code: code, lang: lang},
		headers: {'Content-Type': 'application/json'}
	},
	// data and response are from the executor
	(data, response) => {
		const text = `Build output: ${data['build']}, execute output: ${data['run']}`;
		// we packaged the result from executor, and send back to oj-client
		res.json(text);
	}
	)
});


module.exports = router;