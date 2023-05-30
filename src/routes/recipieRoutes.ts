import express from "express";
import * as recipeController from "../controllers/recipieControllers";

const router = express.Router();

router.get("/", recipeController.getRecipies);
router.post("/", recipeController.createRecipie);

export default router;
