const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');


const catagories = require('./data/catagories.json')

app.use(cors())
app.use(express.json()) 


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fpgnyx0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
   
    try {

     const usersCollection = client.db('bikehutCollection').collection('users')
     const bikesCollection = client.db('bikehutCollection').collection('bikes')
    
        
     app.put("/user/:email", async (req, res) => {
        try {
            const email = req.params.email;

            // check the req
           
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);

            // token generate 
            const token = jwt.sign(
                { email: email },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "1d" }
            )
            res.send({
                status: "success",
                message: "Token Created Successfully",
                data: token
            })


        }
        catch (err) {
            console.log(err)
        }
    })
        
        
        app.post('/addbikes', async (req, res) => {

            const body = req.body;
            const result = await bikesCollection.insertOne(body);
            res.send(result)

    })

    }
    finally {
        
    }
    
}
run().catch(err=>console.log(err))


app.get('/', (req, res) => {
    res.send('Server is Running')
})
app.get('/catagories', (req, res) => {
    res.send(catagories)
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})