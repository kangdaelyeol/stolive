import { MongoClient, ServerApiVersion } from 'mongodb'
import mongoose from 'mongoose'
import dotenv from "dotenv"

dotenv.config();

const uri = `mongodb+srv://asa47972000:${process.env.MONGO_PW}@cluster0.m9vebxs.mongodb.net/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
})

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect()
        await mongoose.connect(uri)
        // Send a ping to confirm a successful connection
        await client.db('admin').command({ ping: 1 })
        console.log(
            'Pinged your deployment. You successfully connected to MongoDB!',
        )
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close()
    }
}
run().catch(console.dir)
