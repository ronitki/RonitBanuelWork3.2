var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var DButilsAzure = require('../DButils');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const superSecret = "eeeee"; // secret variable

id = 1
Users = []






//8-getFavoritePoints
router.get('/FavoritePoints',function(req,res){
   // let username=req.params.username;
   let token=req.decoded;
   let username=token.payload.UserName;
    // var t =`select * from Points as p join FavoritePoints as fp on fp.PointID=p.PointID where fp.UserName= '`+username+`'`;
  console.log(username);
    DButilsAzure.execQuery(`select * from Points as p join FavoritePoints as fp on fp.PointID=p.PointID where fp.UserName= '`+username+`'order by fp.Date desc`)   
    .then((response) => {
        simplerans=JSON.parse(JSON.stringify(response));
        if(simplerans.length>=2){
            console.log(simplerans[0]);
            console.log(simplerans[1]);
            let p1=simplerans[0];
            let p2=simplerans[1];
            res.send({p1,p2});
        }
        else if(simplerans.length===1){
            let p1=simplerans[0];
            res.send({p1});
        }
        else{
            res.send("you dont have any saved points");
        }
      //res.send(response);
    })
    .catch((err)=>{
       
            console.log(err);
     })
    //returns the user points
})

//10-addFavoritePoint
router.post('/AddFavoritePoint', function(req,res){
    //let username=req.body.username;
    let token=req.decoded;
    console.log(token);
    let username=token.payload.UserName;
   
    let pointID=req.body.pointID;
    var number;
    var fp= `(CAST((GETDATE()) AS DATE),'`+username+`','`+pointID+`')`;
   
     var fpInsert= `INSERT INTO FavoritePoints (Date, UserName, PointID) VALUES` + fp;
        DButilsAzure.execQuery(fpInsert);
        DButilsAzure.execQuery(`select PointID from FavoritePoints where UserName = '`+username+`'` )
        .then((response) => {
            simplerans=JSON.parse(JSON.stringify(response));
            number=simplerans.length+1;
            console.log(number);
           res.send(number+"");
        })
        .catch((err)=>{
           
                console.log(err);
         })
    

  //  res.send(username+" "+pointID);
    //add favorite point
})
//11-removeFavoritePoint
router.delete('/RemoveFavoritePoint/:pointID', function(req,res){
   // let username=req.params.username;
   let token=req.decoded;
   let username=token.payload.UserName;
    let pointID=req.params.pointID;
    //var fp=`('` +username+ `',` + `'` + pointID + `')`;
    // var fpInsert= `DELETE from FavoritePoints (UserName, PointID) VALUES` + fp;
       
        var queryDelete = `DELETE FROM FavoritePoints WHERE userName='` + username + `' AND pointID='` + pointID + `'`;
        DButilsAzure.execQuery(queryDelete)
        .then((response) => {
            res.send(true);
        })
        .catch((err)=>{
           res.send(false);
                //console.log(err);
         })
        //res.send(username+pointID);
   
    
//res.end()
})
//12-giveReview
router.post('/Review', function(req,res){
   // let username=req.body.username;
   let token=req.decoded;
   let username=token.payload.UserName;
    //console.log(username);
    let pointID=req.body.pointID;
  
    let description=req.body.description;
   // let date=req.body.date;
    //let rating=req.body.rating;
    var review= `(CAST((GETDATE()) AS DATE),'`+username+`','`+pointID+`','`+description+`')`;
   
    var reviewInsert= `INSERT INTO Reviews (Date, UserName, PointID, Review) VALUES` + review;
       DButilsAzure.execQuery(reviewInsert)
       .then((response) => {
        res.send(true);
    })
    .catch((err)=>{
       res.send(false);
            //console.log(err);
     })
    
    
    // send error
})

router.post('/Rate', function(req,res){
    let pointID=req.body.pointID;
    let ranking=req.body.ranking;
    DButilsAzure.execQuery(`select * from Points where PointID = '`+pointID+`'` )
    .then((response) => {
        simplerans=JSON.parse(JSON.stringify(response));
        var rate=simplerans[0].Rating;
        console.log(rate);
        console.log(ranking);
        ranking*=10;
        rate=parseFloat(parseFloat(rate)+parseFloat(ranking));
        rate/=2;
        DButilsAzure.execQuery(`update Points set Rating=`+(rate)+` where pointID='`+pointID+`'`);
        res.send(true);
    })
    .catch((err)=>{
        res.send(false);
           // console.log(err);
     })




})
//6-Show popular points
router.get('/PopularPoints',function(req,res){
    //let username=req.params.username;
    let token=req.decoded;
    let username=token.payload.UserName;
    let categories='';
    var p1;
    var p2;
    var simplerans;
    DButilsAzure.execQuery(`select top 2 CategoryID from UserCategories where UserName = '`+username+`' order by CategoryID asc`)
    .then((response) => {
        categories=response;
        simplerans=JSON.parse(JSON.stringify(categories));
    })
    .then((response) => {
       // simplerans=JSON.parse(JSON.stringify(categories));
       DButilsAzure.execQuery(`select top 1 p.PointID, p.Name, p.Description, p.Img , p.Rating from Points as p where p.CategoryID='`+simplerans[0].CategoryID+`' order by Rating desc`)
       .then((response) => {
            p1=response;
            DButilsAzure.execQuery(`select top 1 p.PointID, p.Name, p.Description, p.Img , p.Rating from Points as p where p.CategoryID='`+simplerans[1].CategoryID+`' order by Rating desc`)
            .then((response) => {
                 p2=response;
                 console.log(p2);
                 res.send({p1,p2});
            }) 
            
       }) 
      
    })
 
    .catch((err)=>{      
            console.log(err);
     })
})




module.exports = router;