const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5001;

// middleWare
app.use(
  cors({
    origin: [
      "https://hotel-booking-web-c8f4f.web.app",
      "https://hotel-booking-web-c8f4f.firebaseapp.com",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// verify token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.Token;
    //Token As a middleware;
    if (!token) {
      return res.status(401).send({ massage: "unAuthorize" });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        // Token verification failed
        return res.status(401).send({ massage: "unAuthorize" });
      }
      req.user = decoded;
      next();
    });
  } catch (err) {
    console.log("I am Under Verify", err);
  }
};

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.iatiqfv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //               <---------------Work For Database Data------------------>

    const bookingCollection = client.db("HotelBooking").collection("Rooms");
    const addbookingCollection = client.db("HotelBooking").collection("books");
    const offerbookingCollection = client
      .db("HotelBooking")
      .collection("offer");

    //               <---------------Start Token For Database Data------------------>
    // Auth Related Access Token
    app.post("/jwt", async (req, res) => {
      try {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1h",
        });

        res
          .cookie("Token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ Success: "Cookies Set Successfully" });
      } catch (error) {
        console.log("Error Post Jwt Token :", error);
      }
    });

    // Remove Token
    app.post("/logout-jwt", async (req, res) => {
      try {
        res
          .clearCookie("Token", { maxAge: 0 })
          .send({ Success: "Cookies Removed Successfully" });
      } catch (error) {
        console.log("Error Post logOut-Jwt Token:", error);
      }
    });
    //               <---------------End Token For Database Data------------------>

    app.get("/Bookings", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    });
    app.get("/Bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.findOne(query);
      res.send(result);
    });

    app.post("/books", async (req, res) => {
      const booking = req.body;

      const result = await addbookingCollection.insertOne(booking);
      res.send(result);
    });
    // update Bookings Availability By id in Update Route
    app.patch("/Bookings/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const data = req.body;

        const query = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            roomAvailability: data.roomAvailability - 1,
          },
        };

        const result = await bookingCollection.updateOne(
          query,
          updateDoc,
          options
        );
        res.send(result);
      } catch (error) {
        console.log(
          "update Bookings Availability By id in Update Route:",
          error
        );
      }
    });
    // update Bookings Availability By id in Update Route
    app.patch("/BookingsRating/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const data = req.body;
        const query = { _id: new ObjectId(id) };
        console.log(data);
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            Rating: data.Rating,
            Review: data.Review,
          },
        };

        const result = await bookingCollection.updateOne(
          query,
          updateDoc,
          options
        );
        res.send(result);
      } catch (error) {
        console.log(
          "update Bookings Availability By id in Update Route:",
          error
        );
      }
    });

    app.get("/books", async (req, res) => {
      const cursor = addbookingCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/books/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await addbookingCollection.deleteOne(query);
      res.send(result);
    });

    //     app.get("/offer", async (req, res) => {
    //       const cursor = offerbookingCollection.find();
    //       const result = await cursor.toArray();
    //       res.send(result);
    //       // res.send({
    //       //   total:result.length,result
    //       //  })
    //     });

    //     app.get("/Bookings/:id", async (req, res) => {
    //       const id = req.params.id;
    //       const query = { _id: new ObjectId(id) };
    //       const options = {
    //         projection: {
    //           roomDescription: 1,
    //           price: 1,
    //           roomSize: 1,
    //           availability: 1,
    //           roomImages: 1,
    //           specialOffers: 1,
    //         },
    //       };
    //       const result = await bookingCollection.findOne(query, options);
    //       res.send(result);
    //     });

    //     app.get("/books/:id", async (req, res) => {
    //       const id = req.params.id;
    //       const query = { _id: new ObjectId(id) };

    //       const result = await addbookingCollection.findOne(query);
    //       res.send(result);
    //     });

    //     app.put("/books/:id", async (req, res) => {
    //       const id = req.params.id;
    //       console.log(id);
    //       const filter = { _id: new ObjectId(id) };
    //       const options = { upsert: true };
    //       const upDateBooks = req.body;
    //       const updateDate = {
    //         $set: {
    //           date: upDateBooks.date,
    //         },
    //       };
    //       const result = await addbookingCollection.updateOne(
    //         filter,
    //         updateDate,
    //         options
    //       );
    //       res.send(result);
    //     });

    //     app.put("/Bookings/:id", async (req, res) => {
    //       const id = req.params.id;
    //       console.log(id);
    //       const filter = { _id: new ObjectId(id) };
    //       const options = { upsert: true };
    //       const upDateBooks = req.body;
    //       const updateDate = {
    //         $set: {
    //           description: upDateBooks.description,
    //           Roomsize: upDateBooks.Roomsize,
    //           price: upDateBooks.price,
    //           availability: upDateBooks.availability,
    //           specialOffers: upDateBooks.specialOffers,
    //           roomImages: upDateBooks.roomImages,
    //         },
    //       };
    //       const result = await bookingCollection.updateOne(
    //         filter,
    //         updateDate,
    //         options
    //       );
    //       res.send(result);
    //     });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello I am a REST API For Assignment-11 ");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
