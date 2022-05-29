const express = require("express");
const app = express();
const ejs = require("ejs");
const mysql = require("mysql2");

app.set("view engine", "ejs");
app.use(express.static("public"));


app.get("/", function(req,res){
  res.render("index")
});

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'password',
  database: 'ssu'
});

// simple query
connection.query(
  'SELECT results.internal, results.end_sem FROM (Students INNER JOIN results ON Students.id = Results.student_id) INNER JOIN courses ON courses.id = results.course_id WHERE regd_no = "FOS-BDS-2020-23-017"',
  function(err, results, fields) {
    if(err){
      console.log(err);
    }
    console.log(results); // results contains rows returned by server
    console.log(fields); // fields contains extra meta data about results, if available
  }
);




app.listen(3000, function(){
  console.log("Server has started at port 3000");
});
