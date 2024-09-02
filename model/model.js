//Model Definition
const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    name:{type:String},
    email:{type:String},
    phone:{type:String},
    adhar:{type:String},
    dob:{type:String},
    panno:{type:String},
    accno:{type:String},
    gst:{type:String},
    address:{
        pincode:{type:String},
        area:{type:String},
        district:{type:String},
        state:{type:String},
    }
})
const userModel=new mongoose.model('userData',userSchema)
module.exports={
    userModel
}