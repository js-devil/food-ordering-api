import express from "express";
import UserController from "../controllers/users";
const router = express.Router();

// login route
router.post("/login", UserController.login);

// register route
router.post("/register", UserController.register);

export default router;
