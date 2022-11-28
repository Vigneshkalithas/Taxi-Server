const express = require("express");

const app = express();

const cors = require("cors");

const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

const dotenv = require("dotenv").config();

const URL = process.env.DB;

// const URL = "mongodb://localhost:27017";

const bcryptjs = require("bcryptjs");

const jwt = require("jsonwebtoken");

const SECRET = process.env.SECRET;

app.use(express.json());

app.use(
  cors({
    orgin: "*",
  })
);

let authenticate = function (req, res, next) {
  console.log(req.header.authorization);
  if (req.headers.authorization) {
    try {
      let verify = jwt.verify(req.headers.authorization, SECRET);
      if (verify) {
        req.userid = verify._id;
        next();
      } else {
        res.status(404).json({ message: "Unauthorized" });
      }
    } catch (error) {
      res.json({ message: "Unauthorized" });
    }
  } else {
    res.json({ message: "Unauthorized" });
  }
};

async function auth(req, res, next) {
  try {
    const data = req.header("react-app-token");

    jwt.verify(data, process.env.SECRET);
    next();
  } catch (err) {
    res.status(401).send({ error: err.message });
  }
}

// user register api

app.post("/userregister", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("Taxi");
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(req.body.password, salt);
    req.body.password = hash;
    await db.collection("users").insertOne(req.body);
    await connection.close();
    res.json({
      message: "User Registered Successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/userregister", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("Taxi");
    const user = await db.collection("users").find().toArray();
    await connection.close();
    res.json(user);
  } catch (error) {
    console.log(error);
  }
});

app.get("/userregister/:id", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("Taxi");
    const user = await db
      .collection("users")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });
    await connection.close();
    res.json(user);
  } catch (error) {
    console.log(error);
  }
});

// user login api

app.post("/userlogin", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("Taxi");
    let userCheck = await db
      .collection("users")
      .findOne({ username: req.body.username });
    if (userCheck) {
      const match = await bcryptjs.compare(
        req.body.password,
        userCheck.password
      );
      if (match) {
        const token = jwt.sign({ _id: userCheck._id }, SECRET);
        res.json({
          message: "User logged in successfully",
          _id: userCheck._id,
          token,
        });
      } else {
        res.json({ error: "Invalid password" });
      }
    } else {
      res.json({
        error: "User not found",
      });
    }
    await connection.close();
  } catch (error) {
    console.log(error);
  }
});

// login check

// app.get("/logincheck", authenticate, (req, res) => {
//     // res.send("Hello World!");
//     try{
//         res.status(200).send(  {message: "Successfull"} )

//     }
//     catch(error){
//     res.status(500).send({ error: "interval error" });

//     }
// })

// driver register api

app.post("/driverregister", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("Taxi");
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(req.body.password, salt);
    req.body.password = hash;
    await db.collection("drivers").insertOne(req.body);
    await connection.close();
    res.json({
      message: "Driver Registered Successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/driverregister", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("Taxi");
    const driver = await db.collection("drivers").find().toArray();
    await connection.close();
    res.json(driver);
  } catch (error) {
    console.log(error);
  }
});

app.get("/driverregister/:id", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("Taxi");
    const driver = await db
      .collection("drivers")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    await connection.close();
    res.json(driver);
  } catch (error) {
    console.log(error);
  }
});

// driver login api

app.post("/driverlogin", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("Taxi");
    let driverCheck = await db
      .collection("drivers")
      .findOne({ username: req.body.username });
    if (driverCheck) {
      const match = await bcryptjs.compare(
        req.body.password,
        driverCheck.password
      );
      if (match) {
        // const token = jwt.sign({_id : driverCheck._id}, SECRET , {expiresIn : "5m"});
        const token = jwt.sign({ _id: driverCheck._id }, SECRET);

        res.json({
          message: "Driver logged in successfully",
          token,
        });
      } else {
        res.json({
          error: "Password is incorrect",
        });
      }
    } else {
      res.json({
        error: "Driver not found",
      });
    }
    await connection.close();
  } catch (error) {
    console.log(error);
  }
});

// user booking api

// app.post("/userbookingdatas", async(req, res) => {
//     try{
//         const connection = await MongoClient.connect(URL);
//         const db = connection.db('Taxi');
//         const user =  await db.collection('users').findOne(({_id : mongodb.ObjectId(req.body.userid)}))
//         const driver =  await db.collection('drivers').findOne(({_id : mongodb.ObjectId(req.body.driverid)}))
//         const booking = {
//             userid : user._id,
//             username : user.username,
//             driverid : driver._id,
//             drivername : driver.drivername,
//             pickup : req.body.from,
//             destination : req.body.to,
//             date : req.body.date,
//             time : req.body.time,
//             //price : req.body.price,
//             // status : "pending"
//         }
//         await db.collection('bookings').insertOne(booking);
//         await connection.close();00
//         res.json({
//             message : "Booking Successfully"
//         })
//     }
//     catch(error){
//         console.log(error)
//     }
// })

app.post("/userbookingdatas", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("Taxi");
    const user = await db
      .collection("users")
      .findOne({ _id: mongodb.ObjectId(req.body.userid) });

    await db.collection("bookingDatas").insertOne(req.body);
    await connection.close();
    res.json({
      message: "Booking Successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/getuserdata", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("Taxi");
    const data = await db.collection("bookingDatas").find().toArray();
    await connection.close();
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

app.get("/getuserdata/:id", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("Taxi");
    const data = await db
      .collection("bookingDatas")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });
    await connection.close();
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
