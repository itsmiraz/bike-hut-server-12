const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');



app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fpgnyx0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {

        const usersCollection = client.db('bikehutCollection').collection('users')
        const bikesCollection = client.db('bikehutCollection').collection('bikes')
        const catagoryCollection = client.db('bikehutCollection').collection('bikecatagories')

     
        // User Api
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

        // bike Catagory
        app.get('/catagories',async (req, res) => {
            const query = {}
            const result = await catagoryCollection.find(query).toArray()
            res.send(result)
        })
        // Bike Api
        app.post('/addbikes', async (req, res) => {

            const body = req.body;
            const result = await bikesCollection.insertOne(body);
            res.send(result)

        })

        app.get('/bikes/:catagory', async (req, res) => {
            const catagory = req.params.catagory;
            const query = {
                brand: catagory
            }
            const result = await bikesCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/allbikes', async (req, res) => {
            const email = req.query.email;
            const query = {
                sellerEmail: email
            };
            const bikes = await bikesCollection.find(query).toArray()
            res.send(bikes)
        })

        // app.get('/bike', async (req, res) => {
        //     const filter = {}
        //     const option = { upsert: true }
        //     const updateDoc = {
        //         $set: {
        //             status:'available',
        //         }
        //     }
        //     const result = await bikesCollection.updateMany(filter, updateDoc, option)
        //     res.send(result)
        // })

        app.put('/advertiseBike/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updateDoc = {
                $set: {
                    advertise:true
                }
            }
            const result = await bikesCollection.updateOne(filter, updateDoc, option);

            res.send(result)
        })

        app.put('/bike/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true };
            const updatedoc = {
                $set: {
                    status: 'sold',  
                    advertise:false,
                }
            }
            const result = await bikesCollection.updateOne(filter, updatedoc, option);
            res.send(result)
        })

        app.delete('/bike/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await bikesCollection.deleteOne(query);
            res.send(result)
        })

    }
    finally {

    }

}
run().catch(err => console.log(err))


app.get('/', (req, res) => {
    res.send('Server is Running')
})


app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})