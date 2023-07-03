import { RequestHandler } from "express";
import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import env from "../util/validateEnv";

///Desc     Make new user
///route    POST user/register
///Access  Public

export const registerNewUser: RequestHandler = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new userModel({
      username: req.body.username,
      password: hashedPassword,
    });
    await user.save();
    res.status(200).json({ Message: "Welcome " + user.username });
  } catch (error) {
    next(error);
  }
};



///Desc     Generate AccessToken
///route    POST user/token
///Access   Private - Password and Username needs to match

interface IUser {
  username: string;
  password: string;
}

export const generateAccessToken: RequestHandler<unknown, unknown, IUser, unknown> = async (req, res, next) => {
    try {
      const { username, password } = req.body;
  
      const user = await userModel.findOne({ username });
  
      if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
  
        if (isPasswordValid) {
          const payload = {
            username: user.username,
          };
  
          const accessToken = jwt.sign(payload, env.ACCESS_SECRET_TOKEN);
          res.json({ accessToken });
        } else {
          res.json({ message: "Incorrect login information." });
        }
      } else {
        res.json({ message: "Incorrect login information."});
      }
    } catch (error) {
      next(error);
    }
  };

  export const deleteUser: RequestHandler = async (req,res,next) => {
try {
    const {username, password} = req.body
    const existingUser = await userModel.findOne({username});
    
    if(existingUser) {
        const isPasswordValid = await bcrypt.compare(
            password,
            existingUser.password
        )
            if (existingUser && isPasswordValid) {
                existingUser.deleteOne();
                res.json("User succcessfully deleted")
            }
    }
} catch (error) {
   next(error) 
}
  }