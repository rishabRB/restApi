const router=require('express').Router()
const {MongoClient} = require('mongodb')
const jwt = require('jsonwebtoken')
const {verifyToken} = require('./verify')
const bcrypt = require('bcrypt')


//register user

router.post('/register',async (req,res)=>{
  const { username , firstName , lastName , password , email} = req.body
  const client = new MongoClient(process.env.MONGOURI)
  try{
   await client.connect()
   const database=client.db('app-data')
	  const user = database.collection('users')
	  const userExit=await user.findOne({username})
	  const emailExit=await user.findOne({email})

    if(userExit || emailExit){
		return userExit ? res.status(201).json('user already exits') : res.status(201).send('Email already exits')
	}
	
	const data={
     firstName,
	 lastName,
	 username,
	 password:await bcrypt.hash(password,10),
	 email,
	}
    
	const User = await user.insertOne(data)
	
	if(User)
	res.status(200).json(User)
	}
  
   catch(err){
	   console.log(err)
  }

})



//user Login
router.post('/login',async (req,res) =>{
  const client=new MongoClient(process.env.MONGOURI)
  const {username,password}=req.body
  try{
    await client.connect()
	const database = client.db('app-data')
	const User = database.collection('users')
	 
	const user = await User.findOne({username})
	if(!user)
	return res.status(401).send('Invalid credential')
	
	const correctPassword = await bcrypt.compare(password,user.password)
	  if(user && correctPassword){
		const accessToken = jwt.sign(user,process.env.JKEY,
			{expiresIn:"3d"}
		)
		res.status(200).json({...user,token:accessToken})
	}
	else{
      res.send('Invalid credential')
	}
	
  }
  finally{
	  await client.close()
  }

})


//get users data
router.get('/find/:id',async (req,res)=>{
   const client = new MongoClient(process.env.MONGOURI)
   const query = req.query.id
   try{
	   await client.connect()
	   const database = client.db('app-data')
	   const Users = database.collection('users')

	   const user = await Users.findOne({_id:query})
	   if(!user)
	   res.status.send('user not exits')

	   res.status(200).send(user)
   }

   catch(err){
	   console.log(err)
   }
})

// Update user
router.put('/update',verifyToken,async(req,res)=>{
  const client=new MongoClient(process.env.MONGOURI)
  const {username,password} = req.body
  try{
	  await client.connect()
	  const database=client.db('app-data')
	  const User = database.collection('users')
      if(username){
	  const userExits = await User.findOne({username})
	  if(userExits)
	  return res.status(401).send('username already exits')
	}

	  const updateDoc={
		  $set:{...req.body,password:await bcrypt.hash(password,10)}	 
	  }
	  const filter={username:req.user.username}

	  const updateUser=await User.findOneAndUpdate(filter,updateDoc,{new:true})

      if(updateUser)
	  res.status(200).json(updateUser)

  }
  finally{
	  await client.close()
  }

})


module.exports = router


