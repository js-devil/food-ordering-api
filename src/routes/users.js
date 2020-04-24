import express from "express";
import UserController from "../controllers/users";
const router = express.Router();
import auth from "../middleware/authentication/auth";

// login route
router.post("/login", UserController.login);

// register route
router.post("/register", UserController.register);
router.post("/change-password", auth, UserController.changePassword);
router.post("/change-avatar", auth, UserController.changeAvatar);

export default router;
