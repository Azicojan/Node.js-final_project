const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const http = require('http');
const parseUrl = require('body-parser');
const app = express();
const fs = require('fs');

const mysql = require('mysql');
const { encode } = require('punycode');
const { connect } = require('http2');


let encodeUrl = parseUrl.urlencoded({ extended: false });

//session middleware
app.use(sessions({
    secret: "secret",
    saveUninitialized:true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
    resave: false
}));

app.use(cookieParser());

let pool = mysql.createPool({
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
    

    pool.getConnection(function(err, connection) {
        
        // checking if a user has already been registered or not
        connection.query(`SELECT * FROM users WHERE firstname = "${firstName}" AND lastname = "${lastName}" AND username = "${userName}" AND password  = "${password}"`, function(err, result){

           
            if(err){
                console.log(err);
                
            }
            if(Object.keys(result).length > 0){
                res.sendFile(__dirname + '/failReg.html');
                console.log(result);
                //console.log(Object.keys(result)); 
                console.log(Object.keys(result).length);  
               // console.log(result[0].firstname);

                
                
            }
            
            /*
              else if(Object.keys(result).length == 0){

                connection.query(`SELECT * FROM users `, function(err, result){
                    
                  // console.log(result[0]);
                   for(let i = 0; i < result.length; i++){
                       
                           
                          // db_password = result[i].password;
                          if(userName === result[i].username && password !== result[i].password){

                           console.log(result[i].password);
                           return res.sendFile(__dirname + '/existingFailReg.html');
                            
                            

                          }
                          
                   };
                                        
                   
                  
                   connection.release();
                   if(err){
                       console.log(err);
                       
                   };
                   
               });

            }  */
            else{              

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
               
               `          
               );
               

           };
            

               // inserting new user data
               let sql = `INSERT INTO users (firstname, lastname, username, password) VALUES ("${firstName}", "${lastName}", "${userName}", "${password}")`;
               connection.query(sql, function (err, result) {
                   if (err){
                       console.log(err);
                   }else{
                       // using userPage function for creating user page
                       userPage();
                       
                   };
               });

            
              


                   };


        });
        
        if (err){
            console.log(err);
        };



     });     


        
       
            

    });
     



app.get("/login", (req, res)=>{
    res.sendFile(__dirname + "/login.html");
    
    
    
});

let user_id;
let filesList;
let similarName;
let project;
let projectList = [];


app.post("/login", encodeUrl, (req, res)=>{
    let userName = req.body.userName;
    let password = req.body.password;
    
    
    
    
    

    pool.getConnection(function(err, connection) {
        if(err){
            console.log(err);
        };

        
        connection.query(`SELECT * FROM users WHERE  username = "${userName}" 
        AND password = "${password}"`, function (err, result) {
          if(err){
            console.log(err);
          };

          if(Object.keys(result).length > 0){
            
            user_id = result[0].id;
            res.redirect('/main');
            
            //userPage();
        }
        else{
            res.sendFile(__dirname + '/failLog.html');
        
        }
         
        /*  function userPage(){
            // We create a session for the main (user page) page and save the user data to this session:
            req.session.user = {
                firstname: result[0].firstname,
                lastname: result[0].lastname,
                username: userName,
                password: password
                
            };      

        }*/
        
        //user_id = result[0].id;
        //console.log(Object.keys(result).length);
        
       // console.log(user_id);
       //console.log(Object.keys(result));         

        });

        
        connection.query(`SELECT filename FROM files;`, function (err, result) {
            if(err){
              console.log(err);
            }
            else {
  
              filesList = result;
              //console.log(filesList);
  
            }
              
          });

          setTimeout(() => {
            connection.query(`SELECT filename FROM files WHERE users_id = "${user_id}";`, function (err, result) {
                if(err){
                  console.log(err);
                }
                else {  
                  
                    project = result;
                  //console.log(project);

                   projectList.length = 0;

                  for(let i = 0; i < project.length; i++){
                    projectList.push(project[i].filename);


                  };
                  
                                    
                  connection.release();
                  
      
                }
                
      
              });

          }, 1000);
          



    });

    
});

app.get('/my_projects', (req, res)=> {

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
                        <h3>Hi, your projects: ${projectList.join(', ')}</h3>
                        <a href="/main">Back to the main page</a>
                    </div>
                </body>
                </html>
                
                `          
                );


            });


//A user's main page

app.get("/main", (req, res)=>{
    res.sendFile(__dirname + "/textarea.html");
});


app.post("/main", encodeUrl, (req, res)=>{
    let project_name = req.body.project_name;
    let textarea = req.body.textarea;
    let file = `${project_name}.txt`;

      for(let i = 0; i < filesList.length; i++){

        if(filesList[i].filename === project_name){
            
            similarName = filesList[i].filename;
            break;
            
           }              
        };


      if(project_name === similarName){
            res.send("<h2>Sorry, such a title already exists. Could you rename it, please?</h2>");


      }
      else{
            pool.getConnection(function(err, connection) {
                if(err){
                    console.log(err);
                };
        
                let sql = `INSERT INTO files (filename, users_id, file_path) VALUES ("${project_name}", "${user_id}", "../Node_final_project/${file}")`;
                connection.query(sql, function (err, result) {

                    projectList.push(project_name);
                    console.log('1 record inserted');
                   
                    connection.release();
                    if (err){
                        console.log(err);
                    }
                    
                   });
                        
               
                });
 
                fs.writeFile( file, textarea, function(err) {
                    if(err) throw err;
                    console.log('A new file has just been saved.')
                });


  
            };     
        

        


      });

    
    
    



app.listen(3000, ()=>{
    console.log("Server running on port 3000");
});


//https://dev.to/jahongir2007/creating-a-login-and-registration-form-with-nodejs-expressjs-and-mysql-database-160n