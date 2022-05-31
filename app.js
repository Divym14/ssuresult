const express = require("express");
const app = express();
const ejs = require("ejs");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", function(req,res){
  res.render("index")
});

const greetingsArray = ["Hello","Welcome", "Howdy", "Hola", "Yo!", "Hi!!!", "Hey!!!"];

app.post("/result",function(req,res){
  let rollNumber = req.body.searchTxt;
  const greetings = getRandomItem(greetingsArray);
  connection.query(
    'SELECT * FROM (Students INNER JOIN results ON Students.id = Results.student_id) INNER JOIN courses ON courses.id = results.course_id WHERE regd_no ="'+rollNumber+'"',
    function(err, results, fields) {
      if(err){
        console.log(err);
      }
      // console.log(results); // results contains rows returned by server
      res.render("result",{results:results, greetings:greetings});
    }
  );
});
// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'password',
  database: 'ssu'
});

// simple query


// *********************** ALl FUNCTIONS BELOW *************************
function getRandomItem(arr) {

    // get random index value
    const randomIndex = Math.floor(Math.random() * arr.length);

    // get random item
    const item = arr[randomIndex];

    return item;
}


app.listen(3000, function(){
  console.log("Server has started at port 3000");
});
