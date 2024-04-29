
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
console.log(process.env.mongodbpw)
console.log(process.env.mongodbuser)

//const uri = `mongodb+srv://${process.env.mongodbuser}:${process.env.mongodbpw}@yelpcamp.hddzzur.mongodb.net/?retryWrites=true&w=majority`;
//console.log(uri)

const uri = "mongodb+srv://terwilld:%265%25bV%26drRktamh8@yelpcamp.hddzzur.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        console.log(client)
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
        console.log(client)
    }
}
run().catch(console.dir);
