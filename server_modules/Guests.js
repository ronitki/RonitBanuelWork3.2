var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var DButilsAzure = require('../DButils');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const superSecret = "eeeee"; // secret variable
function sendToken(UserName, res){
    var payload = {
        UserName:UserName
        
        }
        var token = jwt.sign(payload, superSecret, {
        expiresIn: "1d" // expires in 24 hours
        });
        // return the information including token as
       
        res.json({
        success: true,
        message: 'Enjoy your token!',
        token: token
        });
    
}
//1 Get point's information
router.get('/Information/:id', function (req, res) {
    let pointID=req.params.id;
    let point;
    DButilsAzure.execQuery(`select p.Name, p.NumOfViews, p.Description, p.Rating from Points as p where p.pointID='`+pointID+`'`)
    .then(function(response){ 
        point=response;
        DButilsAzure.execQuery(`UPDATE Points set NumOfViews=`+(response[0].NumOfViews+1)+` where PointID='`+pointID+`'`);
    })
    .then(function(response){
        DButilsAzure.execQuery(`select top 2 Review, Date,UserName from Reviews where pointID='`+pointID+`' order by Date desc`)
            .then(function(response){
            res.send({ point, response})
        })
    })
    .catch((err)=>{
        console.log(err);
    })

});

router.post('/Login', function(req,res){
    let username=req.body.username;
    let password=req.body.password;

    DButilsAzure.execQuery(`select Password from Users where UserName = '`+username+`'` )
    .then((response) => {
        simplerans=JSON.parse(JSON.stringify(response));
        if(simplerans[0]==undefined){
            console.log("no such user");
        }
        else{
            if(simplerans[0].Password.localeCompare(password)==0){
                //console.log("succcess");
                token=sendToken(username,res);
                res.json({success: true, token:token});
            }
            else{
                res.send({success:false});
            }
        }

        res.send(response);
    })
    .catch((err)=>{
       
            console.log(err);
     })

    //if yes send token
})

//Register
router.post('/RegisterUser', function(req,res){
    let firstName=req.body.FirstName;
    let lastName=req.body.LastName;
    let username=req.body.UserName;
    let City=req.body.City;
    let Country=req.body.Country;
    let Email=req.body.Email;
    let question1=req.body.Question1;
    let question2=req.body.Question2;
    let answer1=req.body.Answer1;
    let answer2=req.body.Answer2;
      /*** */
      let categories=req.body.Categories;
      /**** */
    let password=req.body.Password;
    // validation check
  
    var values = `('` + firstName + `',` + `'` + lastName + `',` + `'` + username +`',` + `'` + City  + `',` + `'` + Country + `',` + `'` + Email + `',` + `'` + question1  + `',` + `'` + question2  + `',` + `'` +answer1 + `',` + `'` + answer2  + `',` + `'`+ password + `')`;
    var queryInsert = `INSERT INTO Users (FirstName, LastName, UserName, City, Country, Email, Question1, Question2, Answer1, Answer2, Password) VALUES` + values;
    DButilsAzure.execQuery(queryInsert).then((response)=>{
    categories=categories.split(",");
    for(var i = 0; i < categories.length; i++) {
        var cat=`('` +username+ `',` + `'` + categories[i] + `')`;
        var carInsert= `INSERT INTO UserCategories (UserName, CategoryID) VALUES` + cat;
        DButilsAzure.execQuery(carInsert);

    }
    res.send(true);
})
    .catch((err)=>{ 
        res.send(false);
 })

    //write to database
    //if yes send ok else error
})
router.get('/VerificationQuestions/:UserName', function (req, res) {
    let username=req.params.UserName;
    DButilsAzure.execQuery(`select Question1 ,Question2 from Users where UserName = '`+username+`'` )
    .then((response) => {
        if(response==undefined ||response.length===0){
            res.send("no such user");
        }
        else{
            res.send(response);
        }
    })
    .catch((err)=>{
       
            console.log(err);
     })
    //read questions and send them
})

router.post('/Password', function(req,res){
    let username=req.body.username;
    let answer1=req.body.answer1;
    let answer2=req.body.answer2;

    DButilsAzure.execQuery(`select Answer1, Answer2, Password from Users where UserName = '`+username+`'` )
    .then((response) => {
        //console.log("jjj")
        //res.send(response);
        simplerans=JSON.parse(JSON.stringify(response));
        if((simplerans[0].Answer1.localeCompare(answer1)==0)&&(simplerans[0].Answer2.localeCompare(answer2)==0)){
            res.send(simplerans[0].Password);
        }
        else{
            res.send("one or more answers doesnt match");
        }
       
    })
    .catch((err)=>{
       
            console.log(err);
     })
    //send to answers
})

//7-getRandomPoints
router.get('/RandomPoints/:rating',function(req,res){
    let rating=req.params.rating;
    let ans='';
    rating=rating*10;
    DButilsAzure.execQuery(`select * from Points where Rating>= '`+rating+`'` )
    .then((response) => {
        simplerans=JSON.parse(JSON.stringify(response));
        if (simplerans.length>=3){
        let rand1 = simplerans[Math.floor(Math.random() * simplerans.length)];
        let rand2 = simplerans[Math.floor(Math.random() * simplerans.length)];
        let rand3 = simplerans[Math.floor(Math.random() * simplerans.length)];
        while(rand1===rand2 || rand1===rand3 || rand2===rand3){
                  rand2 = simplerans[Math.floor(Math.random() * simplerans.length)];
                  rand3 = simplerans[Math.floor(Math.random() * simplerans.length)];
        }
       
      
      
           res.send({rand1,rand2,rand3});
    }
    else{
        res.send("The rating you gave is to high, there are not enough points ")
    }
    })
    .catch((err)=>{
       
            console.log(err);
     })

    
    //return the random points
})

//9-getsortedPointsbyCategory
router.get('/PointsbyCategory/:categoryname',function(req,res){
    //let categories=req.params.categories;
    let categoryname=req.params.categoryname;
    DButilsAzure.execQuery(`select p.pointID, p.Name, p.Img , p.Description, p.Rating, p.NumOfViews, c.CName from Points as p join Categories as c on c.CName='`+categoryname+`' where p.CategoryID=c.CategoryID `)
    .then((response) => {
        console.log(response);
        res.send(response);
    })
    .catch((err)=>{
        console.log(err);
    })    //return LIST of All tourist attraction divided into categories
})

//13-gellAllpoints
router.get('/Points',function(req,res){
    DButilsAzure.execQuery(`select * from Points ` )
    .then((response) => {
       res.send(response);
    })
    .catch((err)=>{
       
            console.log(err);
     })
    //retrun all points

})
//14-getAllCategories
router.get('/Categories',function(req,res){
   
    //retrun all categories
    DButilsAzure.execQuery(`select * from Categories ` )
    .then((response) => {
       res.send(response);
    })
    .catch((err)=>{
       
            console.log(err);
     })

})
module.exports = router;

