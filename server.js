//import expree
const express = require("express");

//import mongodb
const mongodb = require("mongodb");

//import cors
const cors = require("cors");

//import body-parser
const bodyParser = require("body-parser");

//create server in express
const app = express();
//use middlewares
app.use(cors());
app.use(bodyParser.json());

//data base url
const dbUrl = " mongodb+srv://rishabh:rishabh1919ps@cluster0.964ns.mongodb.net/DiaryDataBaseProject2?retryWrites=true&w=majority";

//connect to database url or mongo db

mongodb.MongoClient.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
}, (err, client) => {
    if (err) {
        return console.log(err);
    }
    console.log("connected to mongoDb");
    const newDb = client.db("DiaryDataBaseProject")
    //api create here

    //signup api create here
    app.post("/signup", (req, res) => {
        console.log(req.body);
        const { name, phoneNumber, email, password } = req.body;

        //check if user already exists or not
        let existingUser = newDb.collection("User").find({ email: email }).toArray();
        existingUser.then((User) => {
            //if user already exist
            if (User.length > 0) {
                return res.status(201).json("User already exist");
            }
            //if user does not exist
            else if (User.length < 1) {
                let createUser = newDb.collection("User").insertOne({ name: name, phoneNumber: phoneNumber, email: email, password: password });
                //or insertOne(req.body)
                createUser.then((User) => {
                    res.status(200).json(User.ops);
                });
            }
        });

    });
    //login api
    app.post("/login", (req, res) => {
        console.log(req.body);
        const { email, password } = req.body;
        //check user exist or not
        let existingUser = newDb.collection("User").find({ email: email }).toArray();
        existingUser.then((User) => {
            //if user not exist
            if (User.length < 1) {
                return res.status(201).json("User does not exist,Please sign up instead");
            }
            //if user exist
            else if (User.length > 0) {
                //if password match
                if (password === User[0].password) {
                    return res.status(200).json(User);
                }
                //if password not match
                else {
                    res.status(201).json("password not matched");
                }
            }

        }); 
    });
    //api for create diary
    app.post("/createDiary",(req, res) =>{
        console.log(req.body);
        const{title,description,date,UserId}=req.body;

        let createdDiary=newDb.collection("Diary").insertOne({title:title,description:description,date:date,UserId:UserId,});
        createdDiary.then((Diary)=>{
            console.log(Diary);
            return res.status(200).json(Diary.ops[0]);
        })
        .catch((err)=>{
            return res.status(500).json("Error in Saving Diary");
        })
        title.value="";
        description.value="";
        date.value="";
    
    });
    //get Diary
    app.get("/getDiary/:UserId",(req,res)=>{
        console.log(req.params.UserId);
        //get all Diary for user which logged in
        let allDiary=newDb.collection("Diary").find({UserId:req.params.UserId}).toArray();
        allDiary.then((Diary) => {
            console.log(Diary);
            return res.status(200).json(Diary);
          })
          .catch((err) => {
            return res.status(500).json("Error in getting Diary");
          });
      });
        //delete diary
    app.delete("/deleteDiary/:UserId/:DiaryId", (req, res) => {
        console.log(req.params.DiaryId);
  
        let deleteDiary = newDb.collection("Diary").deleteOne({ _id: new mongodb.ObjectId(req.params.DiaryId) });
        deleteDiary.then((Diary) => {
          console.log(Diary);
          //get all diary for user which loggedIn
          let allDiary = newDb.collection("Diary").find({ UserId: req.params.UserId }).toArray();
          allDiary.then((Diary) => {
              console.log(Diary);
              return res.status(200).json(Diary);
            })
            .catch((err) => {
              return res.status(500).json("Error in getting diary");
            });
        });
      });
  
      //api for updation of diary
      app.patch("/updateDiary",(req,res)=>{
        console.log(req.body);
        let updateDiary=newDb.collection('Diary').findOneAndUpdate({_id: new mongodb.ObjectID(req.body.DiaryId)},
        {
          $set:{
            title:req.body.title,
            description:req.body.description,
            date:req.body.date
          }
        },{new: true,runValidators:true,returnOriginal:false})
        updateDiary.then(Diary=>{
          console.log(Diary);
          let allDiary = newDb.collection("Diary").find({ UserId:req.body.UserId }).toArray();
          allDiary.then((Diary) => {
              console.log(Diary);
              return res.status(200).json(Diary);
            })
            .catch((err) => {
              return res.status(500).json("Error in getting diary");
            });
        })
      })
    });
    //run server

    app.listen(8081, () => {
        console.log("server started");

    });
