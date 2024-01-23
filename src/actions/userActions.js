const User = require("../db/models/user")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserActions{
    async singupUser(req,res){
            const data = {
              email: req.body.email,
              password: req.body.password,
            };
            const existingUser = await User.findOne({ email: data.email });
          
            if (existingUser) {
              res.send("User already exists.");
            } else {
              const saltRounds = 10;
              const hashedPassword = await bcrypt.hash(data.password, saltRounds);
          
              data.password = hashedPassword;
          
              const userdata = await User.insertMany(data);
              console.log(userdata);
              res.send("Sucess");
            }
    }
    async loginUser(req,res){
        try {
            const check = await User.findOne({ email: req.body.email });
            if (!check) {
              return res
                .status(404)
                .json({
                  error: "User not found",
                  message: "User with provided email not found.",
                });
            } 
            const isPasswordMatch = await bcrypt.compare(
              req.body.password,
              check.password
            );
            if (!isPasswordMatch) {
              return res
                .status(401)
                .json({ error: "Unauthorized", message: "Incorrect password." });
            } else {
              const token = jwt.sign({ userId: check._id }, process.env.SECRET_KEY, {
                expiresIn: "1h",
              }); 
              return res
                .status(200)
                .json({
                  session: { token },
                  user: {
                    role: "authenticated",
                    user_metadata: {
                        fullName: check.fullName,
                        avatar: check.avatar,
                    }
                  },
                });
            }
          } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
          }
    }
    async verifyUser(req,res){
         
        const token = req.body.token;
        
        if (!token) {
            return res.status(401).json({ error: "Unauthorized", message: "Token not provided." });
        }
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
            return res
                .status(401)
                .json({ error: "Unauthorized", message: "Invalid token." });
            }else{
              return res.status(200).json({ message: "Token is valid.", user: req.body.user });
            }
            
        });
        
    }
    async addCart(req,res){
      const {user} = req.query
      const data = req.body
      
      try {
        await User.updateOne({ fullName: user }, { $set: { cart: data} });
        res.status(200).json({ message: "Cart updated successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
      

    }
    async getCart(req,res){
      const {user} = req.query
      console.log(user);
      try {
        const data = await User.find({fullName: user},{cart: 1,_id: 0});
        res.status(200).json(data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    }

}
module.exports = new UserActions()