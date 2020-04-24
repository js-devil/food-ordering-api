"use strict";

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cors = require("cors");

var _cors2 = _interopRequireDefault(_cors);

var _helmet = require("helmet");

var _helmet2 = _interopRequireDefault(_helmet);

var _morgan = require("morgan");

var _morgan2 = _interopRequireDefault(_morgan);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _routes = require("./routes");

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require("dotenv").config();

// import controllers from "./controllers";
// import models from "./models";

var app = (0, _express2.default)();

// adding Helmet to enhance API's security
app.use((0, _helmet2.default)());

// using bodyParser to parse JSON bodies into JS objects
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: false }));
app.use(_express2.default.static(_path2.default.join(__dirname, "public")));

// enabling CORS for all requests
app.use((0, _cors2.default)());

// adding morgan to log HTTP requests
app.use((0, _morgan2.default)(":method :url :status :res[content-length] - :response-time ms"));

// API Routes
app.use("/users", _routes2.default.users);
app.use("/menu", _routes2.default.menu);
app.use("/tokens", _routes2.default.tokens);
app.use(_routes2.default.orders);

app.listen(process.env.PORT, function () {
  console.log("Server is running on port " + process.env.PORT);
});