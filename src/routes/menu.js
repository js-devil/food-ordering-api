import express from "express";
import MenuController from "../controllers/menu";
import auth from "../middleware/authentication/auth";
const router = express.Router();

// add food item to menu list route
router.post("", auth, MenuController.addToMenu);

// get all foods on the menu for that day route
router.get("", MenuController.getMenu);

router.post("/:menu_id/update", auth, MenuController.updateQuantity);

router.put("/:menu_id/update", auth, MenuController.updateMenu);
router.delete("/:menu_id", auth, MenuController.deleteMenu);

export default router;
