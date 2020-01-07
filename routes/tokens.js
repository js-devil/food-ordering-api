import express from "express";
import TokenController from "../controllers/tokens";
import auth from "../middleware/authentication/auth";
const router = express.Router();

// add food item to token list route
router.post("/generate", auth, TokenController.generateToken);

// get all foods on the token for that day route
router.get("", auth, TokenController.getTokens);

router.post("/load", auth, TokenController.loadToken);

export default router;
