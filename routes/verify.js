const jwt= require('jsonwebtoken')

const verifyToken = (req,res,next)=> {
   const authHeader = req.headers.token
   if(!authHeader)
   {
    return res.status(401).send('User not authorize')
   }
		const token = authHeader.split(" ")[1]
		jwt.verify(token,process.env.JKEY,(err,user)=>{
			if(err) res.status(201).send('token in not valid')
			req.user = user
			next()
		})
	}

module.exports = {verifyToken}
