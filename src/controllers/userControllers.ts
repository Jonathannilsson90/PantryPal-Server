import { RequestHandler } from "express";
import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../util/validateEnv";


///Desc     Make new user
///route    POST api/user/register
///Access   Public

export const registerNewUser: RequestHandler = async (req, res, next) => {
  try {
    const existingUser = await userModel.findOne({username:req.body.username})

    if(existingUser) {
      return res.status(400).json({Message: "Username taken."})
    }
    
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
///route    POST api/user/token
///Access   Private - Password and Username needs to match

interface IUser {
  username: string;
  password: string;
}

export const generateAccessToken: RequestHandler<
  unknown,
  unknown,
  IUser,
  unknown
> = async (req, res, next) => {
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
        res.json({ accessToken, username: user.username });
      } else {
        res.status(403).send("Incorrect login information.");
      }
    } else {
      res.status(403).send("Incorrect login information.");
    }
  } catch (error) {
    next(error);
  }
};

///Desc     Delete user
///route    DELETE api/user/delete
///Access   Private - Password and Username needs to match

export const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const existingUser = await userModel.findOne({ username });

    if (existingUser) {
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (existingUser && isPasswordValid) {
        existingUser.deleteOne();
        res.status(202).send("User deleted successfully");
      }
    }
  } catch (error) {
    next(error);
  }
};

///Desc     Fetch grocerylist
///route    GET api/user/groceryList
///Access   Private 

export const getGroceryList: RequestHandler = async (req, res) => {
  try {
    const { username } = req.query;
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const groceryList = user.groceryList;
    res.json(groceryList);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching the grocery list" });
  }
};

interface GroceryItems {
  amount: string;
  ingredient: string;
}


///Desc     Add items to grocerylist
///route    POST api/user/addToGroceryList
///Access   Private 

export const addToGroceryList: RequestHandler = async (req, res) => {
  const { username, ingredients } = req.body;
  try {
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

  
    const existingIngredients = user.groceryList.map((item) => item.ingredient);
    const newIngredients = ingredients.filter(
      (item: GroceryItems) => !existingIngredients.includes(item.ingredient)
    );

    if (newIngredients.length === 0) {
      return res
        .status(200)
        .json({ message: "All ingredients already exist in grocery list" });
    }

    user.groceryList.push(...newIngredients);

    await user.save();

    return res
      .status(200)
      .json({ message: "Ingredients added to grocery list successfully" });
  } catch (error) {
    console.error("Error adding ingredients to grocery list:", error);
    res
      .status(500)
      .json({ message: "An error occurred while adding to grocery list" });
  }
};

///Desc     Remove item from grocerylist
///route    DELETE api/user/groceryList
///Access   Private

export const removeFromGroceryList: RequestHandler = async (req, res, next) => {
  try {
    const username = req.query.username;
    const itemId = req.params.itemId;
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const indexToRemove = user.groceryList.findIndex(
      (item) => item._id && item._id.toString() === itemId
    );

    if (indexToRemove === -1) {
      return res
        .status(404)
        .json({ message: "Item not found in grocery list" });
    }

    user.groceryList.splice(indexToRemove, 1);
    await user.save();

    res.json({
      message: "Item removed from grocery list",
      groceryList: user.groceryList,
    });
  } catch (error) {
    next();
  }
};
