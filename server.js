const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const http = require('http');
const parseUrl = require('body-parser');
const app = express();

const mysql = require('mysql');
const { encode } = require('punycode');


let encodeUrl = parseUrl.urlencoded({ extended: false });

//session middleware
app.use(sessions({
    secret: "secret",
    saveUninitialized:true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
    resave: false
}));

app.use(cookieParser());

let con = mysql.createConnection({
    host: "localhost",
    user: "root", // my username
    password: "Traderzik1231983", // my password
    database: "myform"
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/register.html');
})

app.post('/register', encodeUrl, (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let userName = req.body.userName;
    let password = req.body.password;

    con.connect(function(err) {
        if (err){
            console.log(err);
        };
        // checking user already registered or no
        con.query(`SELECT * FROM users WHERE username = '${userName}' AND password  = '${password}'`, function(err, result){
            if(err){
                console.log(err);
            };
            if(Object.keys(result).length > 0){
                res.sendFile(__dirname + '/failReg.html');
            }else{
            //creating user page in userPage function
            function userPage(){
                // We create a session for the dashboard (user page) page and save the user data to this session:
                req.session.user = {
                    firstname: firstName,
                    lastname: lastName,
                    username: userName,
                    password: password 
                };

                res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <title>Login and register form with Node.js, Express.js and MySQL</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body>
                    <div class="container">
                        <h3>Hi, ${req.session.user.firstname} ${req.session.user.lastname}</h3>
                        <a href="/login">Log in</a>
                    </div>
                </body>
                </html>
                `);
            }
                // inserting new user data
                let sql = `INSERT INTO users (firstname, lastname, username, password) VALUES ('${firstName}', '${lastName}', '${userName}', '${password}')`;
                con.query(sql, function (err, result) {
                    if (err){
                        console.log(err);
                    }else{
                        // using userPage function for creating user page
                        userPage();
                    };
                });

        }

        });
    });


});

app.get("/login", (req, res)=>{
    res.sendFile(__dirname + "/login.html");
});

app.post("/login", encodeUrl, (req, res)=>{
    let userName = req.body.userName;
    let password = req.body.password;
    

    con.connect(function(err) {
        if(err){
            console.log(err);
        };
        con.query(`SELECT * FROM users WHERE username = '${userName}' AND password = '${password}'`, function (err, result) {
          if(err){
            console.log(err);
          };

          function userPage(){
            // We create a session for the main (user page) page and save the user data to this session:
            req.session.user = {
                firstname: result[0].firstname,
                lastname: result[0].lastname,
                username: userName,
                password: password,
                
            };

            res.redirect('/main');
            
            

        }

        console.log(req.body);
       
        if(Object.keys(result).length > 0){
            userPage();
        }else{
            res.sendFile(__dirname + '/failLog.html');
        
        }

        });
    });
});

app.get("/main", (req, res)=>{
    res.sendFile(__dirname + "/textarea.html");
});

app.post("/main", encodeUrl, (req, res)=>{
    let project_name = req.body.project_name;
    let textarea = req.body.textarea;

    con.connect(function(err) {
        if(err){
            console.log(err);
        };
        let sql = `INSERT INTO files (filename, file_path) VALUES ('${project_name}', '${textarea}')`;
        con.query(sql, function (err, result) {
            if (err){
                console.log(err);
            }else{
                // using userPage function for creating user page
                console.log('1 record inserted');
                
            };
        });


      });

    });
    




app.listen(3000, ()=>{
    console.log("Server running on port 3000");
});

//https://dev.to/jahongir2007/creating-a-login-and-registration-form-with-nodejs-expressjs-and-mysql-database-160n