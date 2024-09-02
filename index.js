const express=require('express')
const app=express()
require('dotenv').config()
const cors=require('cors')
app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json())
const userRouter=require('./router/router')

app.use('/user',userRouter)

app.listen(process.env.PORT,()=>
{
    console.log(`server running at ${process.env.PORT}`)
})