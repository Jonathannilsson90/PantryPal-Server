import { RequestHandler } from "express";
import recipeModel from "../models/recipeModel";

export const searchRecipe: RequestHandler = async (req, res, next) => {
  const searchTerm = req.query.query as string;

  try {
    const recipes = await recipeModel
      .find({ title: { $regex: searchTerm, $options: "i" } })
      .exec();

    if (recipes.length === 0) {
      return res.status(404).json({ error: "No recipes found" });
    }

    res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};