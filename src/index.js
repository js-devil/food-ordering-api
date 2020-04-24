require("dotenv").config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import router from "./routes";
// import controllers from "./controllers";
// import models from "./models";

const app = express();

// adding Helmet to enhance API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./public")));

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

// API Routes
app.use("/users", router.users);
app.use("/menu", router.menu);
app.use("/tokens", router.tokens);
app.use(router.orders);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
