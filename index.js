const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express()
const port = process.env.PORT || 9000
const accessToken= '8a4e9ef23edf1f410d055e72740c02ae12c17e1222dfc31f90e83b2eaee93917bc5a8e43f06f8252867923d208298df51348d95eb7a705df27e235efc80a47d5'

const uri = `mongodb+srv://doctorcar:ABG4yksvLNwdeZoS@cluster0.tdolxqi.mongodb.net/?retryWrites=true&w=majority`;





// middeleware 
app.use(cors())
app.use(express.json())
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });


const varifyJwt = (req,res,next)=>{
    const authorization =  req.headers.authorization
        if(!authorization){
            return res.status(401).send({error:true,message:'unAuthorization Access'})
        }
    const token = authorization.split(' ')[1]
    jwt.verify(token,accessToken,(error,decoded)=>{
        if(error){
            return res.status(403).send({error:true,message:'unAuthorization Access'})
        }
        req.decoded = decoded
        next()
    })
}



async function run() {
  try {
    await client.connect();
    console.log('mongodb is running...')
    const database = client.db("doctors");
    const servicesCollection = database.collection("doctorservices");
    const bookingsCollection = database.collection("bookings");

    app.post('/jwt',(req,res)=>{
        const user = req.body 
        console.log(user)
        const token = jwt.sign(user,accessToken,{expiresIn:'3h'})
        console.log(token)
        res.send({token})
    })
   
    app.get('/services',async(req,res)=>{
        const cursor = servicesCollection.find({})
        const result = await cursor.toArray()
        res.send(result)
    })
    app.get('/services/:id',async(req,res)=>{
        const id = req.params.id
        const query = {_id:new ObjectId(id)}
            const options = {
                projection: { title: 1, img: 1 ,price:1,service_id:1},
            };
        const result = await servicesCollection.findOne(query,options)
        res.send(result)
    })

    app.post('/bookings', async(req,res)=>{
        const data = req.body 
        const result = await bookingsCollection.insertOne(data)
        console.log(result)
        res.send(result)
    })
   
    app.get('/bookings',varifyJwt,async(req,res)=>{
        const decoded = req.decoded
            if(decoded.email !== req.query.email){
                return res.status(403).send({error:1,message:'forbidden Access'})
            }
        let query = req.query 
            if(req.query?.email){
                query = {email:req.query.email}
            }
        const reuslt = await bookingsCollection.find(query).toArray()
        res.send(reuslt)
    })


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('server is running....')
})

app.listen(port,()=>{
    console.log(`lisinig port number ${port}`)
})