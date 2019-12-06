//Importing the necessary libraries.
var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

//Starting express and assigning function as variable.
var app = express();

//Creating mysql connection.
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'renan',
	password : '000',
	database : 'nodelogin'
});

//Starting use of session.
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//Declaring the parses to be used.
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Main page loading html file.
app.get('/', function(request, response){
    response.sendFile(path.join(__dirname + '/login.html'));
/*     if(request.session.notLoggedIn){
        response.send(request.session.wrong);
        request.session.destroy();
    } */
}); 

//Authentication from login.
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

//Redirect from authentication.
app.get('/home', function(request, response) {
	if (request.session.loggedin) {
        response.redirect('/mypage');
	} else {
        response.send('Please login to view this page!');
	}
	response.end();
});

//Getting to a private page only for logged in users.
app.get('/mypage', function (request,response){
    if(request.session.loggedin){
        response.sendFile(path.join(__dirname + '/welcome.html'));
        request.session.destroy();
    }else{
        request.session.notLoggedIn = true;
        request.session.wrong = "Please login first";
        response.redirect('/');
    }
});

//Starting app on port 3000.
app.listen(3000);