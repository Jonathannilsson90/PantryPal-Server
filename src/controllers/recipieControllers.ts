import { RequestHandler } from "express";
import recipeModel from "../models/recipeModel";
import createHttpError from "http-errors";
import mongoose from "mongoose";
export const getAllRecipes: RequestHandler = async (req, res, next) => {
  try {
    const recipes = await recipeModel.find().exec();
    res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};

export const getRecipe: RequestHandler = async (req, res, next) => {
  const recipeId = req.params.recipeId;

  try {
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      throw createHttpError(400, "Invalid recipe ID");
    }

    const recipe = await recipeModel.findById(recipeId).exec();
    if (!recipe) {
      throw createHttpError(404, "Recipe not found");
    }
    res.status(200).json(recipe);
  } catch (error) {
    next(error);
  }
};

interface createRecipeBody {
  title: string;
  text: string;
  instructions: string;
  tags: string;
  image: string;
  ingredients: string;
}

export const createRecipe: RequestHandler<
  unknown,
  unknown,
  createRecipeBody,
  unknown
> = async (req, res, next) => {
  const title = req.body.title;
  const text = req.body.text;
  const instructions = req.body.instructions;
  const tags = req.body.tags;
  const image = req.body.image;
  const ingredients = req.body.ingredients;

  try {
    if (!title || !text) {
      throw createHttpError(400, "Recipe must have a title and text");
    }

    const newRecipe = await recipeModel.create({
      title: title,
      text: text,
      instructions: instructions,
      tags: tags,
      image: image,
      ingredients: ingredients,
    });

    res.status(201).json(newRecipe);
  } catch (error) {
    next(error);
  }
};

interface updateRecipeParams {
  recipeId: string;
}

interface updateRecipeBody {
  title?: string;
  text?: string;
  instructions?: string;
  tags?:  string[];
  image?:  string;
  ingredients?:  {amount?: string; ingredient?: string;}[]
}

export const updateRecipe: RequestHandler<
  updateRecipeParams,
  unknown,
  updateRecipeBody,
  unknown
> = async (req, res, next) => {
  const recipeId = req.params.recipeId;
  const newTitle = req.body.title;
  const newText = req.body.text;
  const newInstructions = req.body.instructions ?? '';
  const newTags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags || ''];
  const newImage = req.body.image ?? '';
  const newIngredients = Array.isArray(req.body.ingredients) ? req.body.ingredients : [{ingredient: req.body.ingredients || '', amount: ''}]

  try {
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      throw createHttpError(400, "Invalid recipe ID");
    }
    if (!newTitle || !newText ) {
      throw createHttpError(400, "Recipe must have a title and text");
    }
    const recipe = await recipeModel.findById(recipeId).exec();
    if (!recipe) {
      throw createHttpError(404, "Recipe not found");
    }
    recipe.title = newTitle;
    recipe.text = newText;
    recipe.instructions = newInstructions;
    recipe.tags = newTags;
    recipe.image = newImage;
    recipe.ingredients = newIngredients;
   
    const updatedRecipe = await recipe.save();

    res.status(200).json(updatedRecipe);
  } catch (error) {
    next(error);
  }
};

export const deleteRecipe: RequestHandler = async (req, res, next) => {
  const recipeId = req.params.recipeId;

  try {
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      throw createHttpError(400, "Invalid recipe ID");
    }
    const recipe = await recipeModel.findById(recipeId).exec();

    if (!recipe) {
      throw createHttpError(404, "Recipe not found");
    }

    await recipe.deleteOne();

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
