const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

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

        const query = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            roomAvailability: 0,
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
