const express = require('express');
const path = require('path');
const app = express();

//connect to mongodb
const mongoose = require('mongoose');
mongoose.connect('mongodb://databaseuser1:databaseuser1@ds129393.mlab.com:29393/cs503-1');

const restRouter = require('./routes/rest');
const indexRouter = require('./routes/index');

//app.get('/', (req, res) => {
//	res.send("Hello World from express!");
//});


app.use('/api/v1', restRouter);
app.use(express.static(path.join(__dirname, '../public')));

app.listen(3000, () => {
	console.log('App is listening port 3000!')
});

app.use((req, res) => {
	res.sendFile('index.html', {root: path.join(__dirname, '../public')});
})