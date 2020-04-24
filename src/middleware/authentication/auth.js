import jwt from "jsonwebtoken";

const splitLoginToken = (req, res, next) => {
  //get auth header value
  const bearerHeader = req.headers["authorization"];

  //get token of bearer header !== undefined
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    req.token = bearer[1];
    next();
  } else {
    res.status(401).json("Access Denied!");
  }
};

export default splitLoginToken;
