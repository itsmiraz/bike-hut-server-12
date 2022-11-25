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
        const bookedBikeCollection = client.db('bikehutCollection').collection('bookedBikes')


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

        app.get('/user', async (req, res) => {
            const email = req.query.email;
            // console.log(email)

            let query = {}

            if (email) {
                query = {

                    email: email

                }
            }
            const result = await usersCollection.find(query).toArray();
            res.send(result)
        })

        // Verify Seller 
        app.put('/verifyseller', async (req, res) => {
            const email = req.query.email;
            const filter = {
                email: email
            }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    verifySeller: true,
                }
            }

            const result = await usersCollection.updateOne(filter, updateDoc, option)
            res.send(result)

        })

        // make  user admin 
        app.put('/user/admin/:id',  async (req, res) => {
            
            // const decodedEmail = req.decoded.email;
            // const query = { email: decodedEmail };
            // const user = await usersCollection.findOne(query);
            // if (user?.role === 'admin') {
            //     res.status(403).send({ message: "Forbiddn Access" });
            // }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, option)
            res.send(result)
        })

        // Check Admin 
        app.get("/user/admin/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === "admin" });
        });


        // bike Catagory
        app.get('/catagories', async (req, res) => {
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

        app.get('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                catagoryId: id
            }
            const result = await bikesCollection.find(query).toArray();
            res.send(result)
        })
        // advertise bike
        app.get('/allbikecollection', async (req, res) => {
            const query = {}
            const result = await bikesCollection.find(query).toArray()
            res.send(result)
        })

        // get bike by user email
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
                    advertise: 'true'
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
                    advertise: 'false',
                }
            }
            const result = await bikesCollection.updateOne(filter, updatedoc, option);
            res.send(result)
        })

        // edit bike post
        app.put('/editbikedetails/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updateDoc = {
                $set: {
                    model: body.model,
                    catagoryId: body.catagoryId,
                    condition: body.condition,
                    totalDriven: body.totalDriven,
                    orginalPrice: body.orginalPrice,
                    resalePrice: body.resalePrice,
                    sellerNumber: body.sellerNumber,
                    sellerLocation: body.sellerLocation,
                    bikedetails: body.bikedetails,
                    status: body.status,
                    purchaseDate: body.purchaseDate,
                }
            }

            const result = await bikesCollection.updateOne(filter, updateDoc, option);
            res.send(result)

        })


        app.delete('/bike/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await bikesCollection.deleteOne(query);
            res.send(result)
        })


        //-------------- Booked Bikes ------------
        app.post('/book', async (req, res) => {
            const body = req.body;
            const result = await bookedBikeCollection.insertOne(body)
            res.send(result);

        })

        app.get('/booked', async (req, res) => {
            const email = req.query.email;
            const query = {
                buyerEmail: email
            }
            const result = await bookedBikeCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/buyers', async (req, res) => {
            const email = req.query.email;
            const query = {
                sellerEmail: email

            }

            const result = await bookedBikeCollection.find(query).toArray()
            res.send(result)

        })

        app.delete('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await bookedBikeCollection.deleteOne(query);
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