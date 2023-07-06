import express from "express";
import * as userController from "../controllers/userControllers"

const router = express.Router();

router.post("/register",userController.registerNewUser)
router.post("/token", userController.generateAccessToken)
router.delete("/", userController.deleteUser)

export default router;