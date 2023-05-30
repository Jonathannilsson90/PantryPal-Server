import { RequestHandler } from "express";
import recipeModel from "../models/recipeModel";
export const getRecipies: RequestHandler = async (req, res, next) => {
    try {
        const recipes = await recipeModel.find().exec()
        res.status(200).json(recipes)
        
    } catch (error) {
        next(error)
    }
  };

  export const createRecipie: RequestHandler = async (req,res,next) => {
    const title = req.body.title;
    const text = req.body.text;
    
    try {
        const newRecipe = await recipeModel.create({
            title: title,
            text: text,
        });

        res.status(201).json(newRecipe)
    } catch (error) {
        next(error)
    }
  }