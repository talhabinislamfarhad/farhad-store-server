const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const cors = require('cors')
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.inlm9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("store");
        const storeCollection = database.collection("watchs");
        const orderCollection = database.collection('order');
        const usersCollection = database.collection('user');
        const reviewCollection = database.collection('review');
        // post api
        app.post('/watchs', async (req, res) => {
            const watch = req.body;
            const result = await storeCollection.insertOne(watch);
            res.json(result)
        });

        // get Wacth
        app.get('/watchs', async (req, res) => {
            const watch = storeCollection.find({});
            const result = await watch.toArray();
            res.send(result);
        });
        // review post api
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result)
        });
        // get review
        app.get('/review', async (req, res) => {
            const review = reviewCollection.find({});
            const result = await review.toArray();
            res.send(result);
        });
        // placorder
        app.post('/placeorder', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result)
        });
        // Orderplace api
        app.get('/allconfirmorder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const allorders = await storeCollection.findOne(query);
            res.send(allorders);
        });
        // get all user
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const allUser = await cursor.toArray();
            res.json(allUser);
        });
        // upsert api 
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const update = { $set: user };
            const result = await usersCollection.updateOne(filter, update, options);
            res.json(result)
        })
        //get my orders
        app.get("/myorders/:email", async (req, res) => {
            const result = await orderCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });
        // get all product
        app.get('/allproducts', async (req, res) => {
            const product = storeCollection.find({});
            const result = await product.toArray();
            res.send(result);
        });
        //get manage orders
        app.get("/manageorders", async (req, res) => {
            const manageorder = orderCollection.find({});
            const getManageOrder = await manageorder.toArray();
            res.json(getManageOrder);
        });
        // delete all product 
        app.delete("/deleteallproduct/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await storeCollection.deleteOne(query);
            res.json(result);
        });
        // delete all order 
        app.delete("/allorderdelete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        });
        // delete my order 
        app.delete("/orderdelete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        });
        // update order 
        app.put('/placeorders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const statusUpdate = {
                $set: {
                    status: 'Approved'
                }
            };
            const result = await orderCollection.updateOne(filter, statusUpdate, options);
            res.json(result)
        });
        //make admin role
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const roleUpdate = {
                $set: {
                    role: 'admin'
                }
            };
            const result = await usersCollection.updateOne(filter, roleUpdate, options);
            res.json(result)
        });
        //make admin role api
        app.get("/users/:email", async (req, res) => {
            const userEmail = req.params.email;
            const userQuery = { email: userEmail };
            const userRole = await usersCollection.findOne(userQuery);
            let isAdmin = false;
            if (userRole?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
            console.log({ admin: isAdmin })
        });

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})