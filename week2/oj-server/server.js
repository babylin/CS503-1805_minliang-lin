const express = require('express');
const path = require('path');

var http =require('http');
var socketIO =require('socket.io');
var io =socketIO();
var editorSocketService = require('./services/editorSocketService')(io);

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

// app.listen(3000, () => {
// 	console.log('App is listening port 3000!')
// });


const server = http.creatServer(app);
io.attach(server);
server.listen(3000);
server.on('listening', () => {
	console.log('App is listening port 3000!');
 });




app.use((req, res) => {
	res.sendFile('index.html', {root: path.join(__dirname, '../public')});
})