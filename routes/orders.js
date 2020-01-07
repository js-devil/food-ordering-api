import express from "express";
import OrderController from "../controllers/orders";
import auth from "../middleware/authentication/auth";
const router = express.Router();

// make order route
router.post("/order", auth, OrderController.makeOrder);
router.post("/order/:order_id/answer", auth, OrderController.attendToOrder);
router.post("/order/:order_id/cancel", auth, OrderController.cancelOrder);

// get all orders for that day route
router.get("/orders", auth, OrderController.getOrders);

export default router;
