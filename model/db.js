const mongoose=require('mongoose')
require('dotenv').config()
async function main()
{
   await mongoose.connect(process.env.MONGO_URL)
   console.log('connected to database')
} 
module.exports={
    main
}