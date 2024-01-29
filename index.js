const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
// const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Animation web server is running.....");
});

// todo:
// jwt
// app.post("/jwt", (req, res) => {
//   const email = req.body;
//   const token = jwt.sign(email, process.env.Jwt_ACCESS_SECRET, {
//     expiresIn: "1d",
//   });
//   res.send({ token });
// });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ybzmsy1.mongodb.net/?retryWrites=true&w=majority`;

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
    client.connect();
    const myCollection = client.db("animationWebDB").collection("contactUs");

    // get all contact details
    app.get("/contact", async (req, res) => {
      const cursor = myCollection.find({});
      const allValues = await cursor.toArray();
      res.send(allValues || []);
    });

    // get a contact details
    app.get("/contact/:_id", async (req, res) => {
      const _id = req.params._id;
      try {
        const query = { _id: new ObjectId(_id) };
        const findResult = await myCollection.findOne(query);
        res.send(findResult || { error: true, message: "no found" });
      } catch (error) {
        res.send({ error: true, message: "Meeting user _id not valid" });
      }
    });
    // add a contact details
    app.post("/contact", async (req, res) => {
      const data = req.body;
      const doc = {
        ...data,
        insertDate: new Date(),
        status: "pending",
      };

      // insert data
      const result = await myCollection.insertOne(doc);
      if (result?.acknowledged) {
        res.send({ error: false, message: "success" });
        return;
      }

      res.send({ error: true, message: "Data insert problems?" });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
