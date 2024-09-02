
const {main}=require('../model/db')
main().catch(err => console.error('Database connection error:', err))
const{userModel}=require('../model/model');
//Function for registering the user
const registerUser=async(req,res)=>
{
    const {name,email,phone,dob,adhar,panno,accno,gstno,address:{pincode,area,district,state}}=req.body
    console.log(name,email,phone,dob,adhar,panno,accno,gstno,pincode,area,district,state)
    await userModel.create({
        name,
        email,
        phone,
        dob,
        adhar,
        panno,
        accno,
        gstno,
        address:{
            pincode,
            area,
            district,
            state
        }
    })
    res.json({status:1,message:"data recieved"})
}
module.exports={
    registerUser,
}