const express = require('express');

const app = express();

const restRouter = require('./route/rest');

//app.get('/', (req, res) => {
//	res.send("Hello World from express!");
//});

app.use('/api/v1', restRouter);

app.listen(3000, () => {
	console.log('App is listening port 3000!')
});
