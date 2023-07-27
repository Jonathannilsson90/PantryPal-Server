import express from "express";
import * as userController from "../controllers/userControllers";
const router = express.Router();

router.post("/register", userController.registerNewUser);
router.post("/token", userController.generateAccessToken);
router.delete("/delete", userController.deleteUser);

router.post("/addToGroceryList", userController.addToGroceryList);
router.get("/groceryList", userController.getGroceryList);
router.delete("/deleteGroceryItem/:itemId", userController.removeFromGroceryList)

export default router;
