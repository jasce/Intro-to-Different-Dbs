const express = require("express");
const { MongoClient } = require("mongodb");

const connectionString = "mongodb://localhost:27017";

async function init() {
  const client =  new MongoClient(connectionString);

  await client.connect();
  const app = express();

  const db = await client.db("adoption");
  const collection = db.collection("pets");

  await collection.createIndex({
    name: "text",
    breed: "text",
    type: "text"
  });
  

  app.get('/get', async(req, res) => {

    const pets = await collection.find(
      {
        $text: {$search: req.query.search}
      }, 
      { _id: 0}
    )
    .sort({ score: { $meta: "textScore" }})
    .limit(10)
    .toArray();

    res.json({ status: "ok" , pets}).end();

  });

  const PORT = "8000";
  app.use(express.static('./static'));
  app.listen(PORT);
  console.log(`running app on http://localhost:${PORT}`);
}

init();