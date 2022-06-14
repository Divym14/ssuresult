const express = require("express");
const app = express();
const ejs = require("ejs");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const Chart = require("chart.js");
const fs = require("fs");
const { createCanvas, loadImage } = require('canvas');




app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

const quotesArray = ["Human evolution has two steps - from being somebody to being nobody; and from being nobody to being everybody. This knowledge can bring sharing and caring throughout the world."
,"Love is not an emotion. It is your very existence.","Faith is realizing that you always get what you need.","Today is a gift from God - that is why it is called the present.",
"Difference between motivation and inspiration - Motivation is external and short lived. Inspiration is internal and lifelong","Life is nothing to be very serious about. Life is a ball in your hands to play with. Don’t hold on to the ball.",
"If you can win over your mind, you can win over the whole world.","Life works on strange laws of nature (Karma). One never knows when a friend turns enemy & vice-versa. Rely on your Self; self-reliance",
"why can't we control our anger? because we love perfection. make a little room for imperfection in our lives."]




app.get("/",function(req,res){
  const quotes = getRandomItem(quotesArray);
  res.render("index",{
    quotes:quotes
  })

});
// app.get("/", function(req,res){
//   res.render("index")
// });



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
  const rollNumber = rollArray[count-1];
  const greetings = getRandomItem(greetingsArray);
  var semNumber = 1;
  if(Number.isInteger(parseInt(req.body.semester))){
    semNumber = req.body.semester;

  }
  else{
    semNumber = 1;
  }

  connection.query('SELECT * FROM (students inner join Dept on students.Dept_id = Dept.id \
    inner join  results on students.id = results.student_id)\
   inner join courses on results.course_id = courses.id \
  WHERE regd_no ="'+ rollNumber+'"'+"AND Results.sem_number="+semNumber,
  function(err,results,fields){
    if (err) {
      console.log(err);
    }else{
         // console.log(results);
    }

    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');

        res.render("analytics",{
          results:results,
          greetings:greetings,
          semNumber:semNumber
        });
      });



  });





app.get("/analytics/data",function(req,res){
  //Fetching Roll Number
  const rollNumber =rollArray[count-1];

  //Fetching Semester Number
  var semNumber = 1;
  if(Number.isInteger(parseInt(req.body.semester))){
    semNumber = req.body.semester;
  }
  else{
    semNumber = 1;
  }

  // Arrays to store name and total for the particular subject
  var subjectName = [];
  var subjectTotal = [];
  var avgData = [78.77,73.32,79.35,63.80,83.10,77.95,71.57,79.42,67.35,76.20,70.30];
  var topData = [98,95,93,88,99,95,94,91,85,98,89];
  var resultArray = [];
  //mysql connection to database
    connection.query('SELECT * FROM (students inner join Dept on students.Dept_id = Dept.id \
      inner join  results on students.id = results.student_id)\
     inner join courses on results.course_id = courses.id \
    WHERE regd_no ="'+ rollNumber+'"',
    function(err,results,fields){
      if (err) {
        console.log(err);
      }else{
        // console.log(results);
        results.forEach(function(result){
          subjectName.push(result.name);
          subjectTotal.push((result.internal+result.end_sem));
        });

       resultArray[0] = mapArrays(subjectName,subjectTotal);
       resultArray[1] = avgData;
       resultArray[2] = topData;
       res.send(resultArray);
      }
    })
});
// *********************** ALl FUNCTIONS BELOW *************************
function getRandomItem(arr) {

    // get random index value
    const randomIndex = Math.floor(Math.random() * arr.length);

    // get random item
    const item = arr[randomIndex];

    return item;
}

const mapArrays = (options, values) => {
 const sender = [];
 for(let i = 0; i < options.length; i++){
    sender.push({
       opt: options[i],
       val: values[i]
    });
 };
 return sender;
};

app.listen(3000, function(){
  console.log("Server has started at port 3000");
});
