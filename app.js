const express = require("express");
const app = express();
const ejs = require("ejs");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const Chart = require("chart.js");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", function(req,res){
  res.render("index")
});

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'password',
  database: 'ssu',
  multipleStatements: true
});

const greetingsArray = ["Hello","Welcome", "Howdy", "Hola", "Yo!", "नमस्ते!!", "Hey!!!", "Bonjour"];
var rollNumber = "";
var rollArray = [];
var count = 0;

app.post("/result",function(req,res){

  var semNumber = 1;
  if (typeof(req.body.searchTxt) === "string") {
    rollNumber = req.body.searchTxt;
    rollArray.push(rollNumber);
    count++;
  }else{
    rollNumber = rollArray[count-1];
  }

  if(Number.isInteger(parseInt(req.body.semester))){
    semNumber = req.body.semester;

  }
  else{
    semNumber = 1;
  }
  console.log(rollNumber);
  console.log(semNumber);

  const greetings = getRandomItem(greetingsArray);
  let searchResult = [];


  connection.query(
    'SELECT * FROM (students inner join Dept on students.Dept_id = Dept.id \
      inner join  results on students.id = results.student_id)\
     inner join courses on results.course_id = courses.id \
    WHERE regd_no ="'+ rollNumber+'"'+"AND Results.sem_number="+semNumber+';SELECT * FROM \
    students inner join result_status on students.id = result_status.student_id \
    WHERE regd_no ="'+ rollNumber+'"'+"AND result_status.sem_number="+semNumber,
    [1,2],
    function(err, results, fields) {
      if(err){
        console.log(err);
      }
      else{
        searchResult = results[0];
        resultStatus = results[1];
      }

      res.render("result",{
        results:searchResult,
        greetings:greetings,
        semNumber:semNumber,
        resultStatus:resultStatus});
    });


});


app.post("/rankings", function(req,res){
  const rollNumber = rollArray[count-1];
  const greetings = getRandomItem(greetingsArray);
  var semNumber = 1;
  var gpa = "sgpa";

  if(Number.isInteger(parseInt(req.body.semester))){
    semNumber = req.body.semester;
    if (semNumber==3) {
      querySemNumber = 2;
    }else{
      querySemNumber = semNumber;
    }
  }
  else{
    semNumber = 1;
    querySemNumber = semNumber;
  }

  if(semNumber == 1 || semNumber == 2){
    gpa = "sgpa";
  }else{
    gpa = "cgpa";
  }


  connection.query('SELECT first_name FROM students WHERE regd_no="'+rollNumber+'"'+';SELECT CONCAT(first_name," ",last_name) as Name,cgpa,sgpa FROM Students \
  inner join result_status on students.id = result_status.student_id WHERE \
  result_status.sem_number= '+querySemNumber+' ORDER BY '+'result_status.'+gpa+' desc',
  [1,2], //semNumber
  function(err,results,fields){
    if(err){
      console.log(err);
    }
    else{
      res.render("rankings",
      {rankings:results[1],
       results:results[0],
       greetings:greetings,
       semNumber:semNumber});
    }

  });

});

app.post("/analytics",function(req,res){
  res.render("analytics");
});

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
