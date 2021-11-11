const express = require('express');
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mieka.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
 
console.log(uri)



async function run(){
     try{
       await client.connect()
       const database = client.db('car_deals')
       const carCollection = database.collection('cars')
       const orderCollection = database.collection('orders')
       const userCollection = database.collection('users')
        console.log('db connected')

        app.post('/cars', async (req, res) =>{
            const carData = req.body;
            const result = await carCollection.insertOne(carData);
            console.log(result)
            res.json(result)
        })

        app.get('/cars', async (req, res) =>{
            const cursor = carCollection.find({}).limit(6);
            const cars = await cursor.toArray()
            res.send(cars)
        })


        app.get('/allCars', async (req, res) =>{
            const cursor = carCollection.find({});
            const cars = await cursor.toArray()
            res.send(cars)
        })


  // orders
        app.post('/orders', async (req, res) =>{
            const orderData = req.body;
            const result = await orderCollection.insertOne(orderData);
            console.log(result)
            res.json(result)
        })


            // get my order for orders
    app.get('/myOrders/:email', async(req, res) =>{
        console.log(req.params.email);
        const result = await orderCollection.find({email: req.params.email}).toArray();
        res.send(result)
    })

  //delete from all orders/booking api
   app.delete('/orders/:id', async (req, res) =>{
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const result = await orderCollection.deleteOne(query);
    console.log('deleting user with id', result);
    res.json(result);
   })

 // post users
   app.post('/users', async (req, res) =>{
      const user = req.body;
      const result = await userCollection.insertOne(user)
      console.log(result);
      res.json(result);
   })

   app.put('/users/admin', async (req, res) =>{
       const user = req.body;
       console.log(user)
       const filter = {email: user.email}
       const updateDoc = {$set:{role: 'admin'}};
       const result = await userCollection.updateOne(filter,updateDoc)
       res.json(result)
   })

   app.get('/users/:email', async (req, res) =>{
       const email = req.params.email;
       const query = {email: email};
       const user = await userCollection.findOne(query)
       let isAdmin = false;
       if(user?.role === 'admin'){
           isAdmin = true;
       }
       res.json({admin: isAdmin});
   })


}
    finally{
       // await client.close()
    }


}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('hello, world!');
})

app.listen(port, () => {
    console.log('running ss on port' ,port)
})