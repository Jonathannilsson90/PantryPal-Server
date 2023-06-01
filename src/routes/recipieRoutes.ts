import express from "express";
import * as recipeController from "../controllers/recipieControllers";

const router = express.Router();

router.get("/", recipeController.getAllRecipes)
router.get("/:recipeId", recipeController.getRecipe);
router.post("/", recipeController.createRecipe);

export default router;
