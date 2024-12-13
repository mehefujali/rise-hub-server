require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000
const app = express()

// middile ware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.negmw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
            // await client.connect();
            // Send a ping to confirm a successful connection
            // await client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
            const database = client.db('risehubDB')
            const campaignClloection = client.db('risehubDB').collection('campaigns')
            const donatedClloection = client.db('risehubDB').collection('donated')
            app.post('/campaigns', async (req, res) => {
                  const newCampaign = req.body
                  const result = await campaignClloection.insertOne(newCampaign)
                  res.send(result)
            })
            app.get('/campaigns', async (req, res) => {
                  const cursor = campaignClloection.find()
                  const result = await cursor.toArray()
                  res.send(result)
            })
            app.get('/campaigns/runningCampaign', async (req, res) => {

                  const now = new Date();
                  const campaigns = await campaignClloection.find().toArray();
                  const runningCampaigns = campaigns
                        .filter(campaign => new Date(campaign.deadline) > now)
                        .slice(0, 12);
                  res.send(runningCampaigns);

            });
            app.get('/campaigns/:id', async (req, res) => {
                  const id = req.params.id
                  const qurry = { _id: new ObjectId(id) }
                  const result = await campaignClloection.findOne(qurry)
                  res.send(result)


            })
            app.post('/donated', async (req, res) => {
                  const newDonate = req.body
                  const result = await donatedClloection.insertOne(newDonate)
                  res.send(result)
            })
            app.get('/mycampaigns/:email', async (req, res) => {
                  const email = req.params.email
                  const qurry = { userEmail: email }
                  const result = await campaignClloection.find(qurry).toArray()
                  res.send(result)
            })
            app.delete('/mycampaigns/:id' , async(req,res) => {
                  const id = req.params.id 
                  const qurry = {_id : new ObjectId(id)}
                  const result = await campaignClloection.deleteOne(qurry)
                  res.send(result)
            })
            app.put('/campaigns/:id' , async (req, res) => {
                  const id = req.params.id 
                  const filter = {_id : new ObjectId(id)}
                  const options = {upsert:true}
                  const updateCampaign = req.body
                  const newCampaign = {
                        $set: {
                              thumbnail :updateCampaign.thumbnail ,
                              title: updateCampaign.title ,
                              minimumAmount : updateCampaign.minimumAmount ,
                              campaignType : updateCampaign.campaignType,
                              description : updateCampaign.description ,
                              deadline : updateCampaign.deadline ,
                              userEmail : updateCampaign.userEmail ,
                              userName : updateCampaign.userName
                        }
                  }
                  const result = await campaignClloection.updateOne(filter,newCampaign,options)
                  res.send(result)
            })
            app.get('/donated/:email',async(req,res)=>{
                   const email = req.params.email 
                   const filter = {email:email}
                   const result = await donatedClloection.find(filter).toArray()
                   res.send(result)
            })
            




      } finally {
            // Ensures that the client will close when you finish/error
            // await client.close();
      }
}
run().catch(console.dir);




app.get('/', (req, res) => {
      res.send("RISE HUB server running")
})

app.listen(port)