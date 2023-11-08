const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

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



    const bookingCollection = client.db("HotelBooking").collection("Bookings");
    const addbookingCollection = client.db("HotelBooking").collection("books");
    const offerbookingCollection = client
      .db("HotelBooking")
      .collection("offer");




























    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  
  }
}
run().catch(console.dir);