import { RequestHandler } from "express";
import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../util/validateEnv";
import recipeModel from "../models/recipeModel";

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

export const generateAccessToken: RequestHandler<
  unknown,
  unknown,
  IUser,
  unknown
> = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log("Received username:", username);
    console.log("Received password:", password);

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

///Desc     delete user
///route    delete user
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
/* 
/// Desc: Set likedrecipes to true for a specific user
/// Route: PUT /api/user/addLiked
/// Access: Private - Requires a valid token
export const addLikedRecipe: RequestHandler = async (req, res, next) => {
  try {
    const { username } = req.body;

    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ Message: "User not found" });
    }

    if (!user.likedrecipes) {
      user.likedrecipes = true;
      await user.save();
      res.status(200).json({ Message: "Recipe added to liked recipes" });
    } else {
      res.status(409).json({ Message: "Recipe already liked" });
    }
  } catch (error) {
    next(error);
  }
};

/// Desc: Set likedrecipes to false for a specific user
/// Route: PUT /api/user/removeLiked
/// Access: Private - Requires a valid token
export const removeLikedRecipe: RequestHandler = async (req, res, next) => {
  try {
    const { username } = req.body;

    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ Message: "User not found" });
    }

    if (user.likedrecipes) {
      user.likedrecipes = false;
      await user.save();
      res.status(200).json({ Message: "Recipe removed from liked recipes" });
    } else {
      res.status(409).json({ Message: "Recipe not liked" });
    }
  } catch (error) {
    next(error);
  }
};
 */

export const getGroceryList: RequestHandler = async (req, res) => {
  try {
    const { username } = req.query;
    // Assuming you have a UserModel with the necessary fields, adjust this to your model
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Assuming your UserModel has a field called 'groceryList' that holds the grocery list items
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

export const addToGroceryList: RequestHandler = async (req, res) => {
  const { username, ingredients } = req.body;
  console.log("Received username:", username);
  console.log("Received ingredients:", ingredients);

  try {
    // Assuming you have a user model to store the grocery list for each user
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if any of the ingredients already exist in the user's grocery list
    const existingIngredients = user.groceryList.map((item) => item.ingredient);
    const newIngredients = ingredients.filter(
      (item: GroceryItems) => !existingIngredients.includes(item.ingredient)
    );

    // If all ingredients are duplicates, return a response indicating that
    if (newIngredients.length === 0) {
      return res
        .status(200)
        .json({ message: "All ingredients already exist in grocery list" });
    }

    // Add the new non-duplicate ingredients to the user's grocery list
    user.groceryList.push(...newIngredients);

    // Save the updated user with the new grocery list
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

export const removeFromGroceryList: RequestHandler = async (req, res, next) => {
  try {
    const username = req.query.username;
    const itemId = req.params.itemId;
    console.log("Received itemId:", itemId);
    console.log("Received username:", username);
    // Find the user by username
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the item to remove in the grocery list array
    const indexToRemove = user.groceryList.findIndex(
      (item) => item._id && item._id.toString() === itemId
    );

    if (indexToRemove === -1) {
      return res
        .status(404)
        .json({ message: "Item not found in grocery list" });
    }

    // Remove the item from the grocery list array
    user.groceryList.splice(indexToRemove, 1);

    // Save the updated user document
    await user.save();

    res.json({
      message: "Item removed from grocery list",
      groceryList: user.groceryList,
    });
  } catch (error) {
    next(error);
  }
};
