import jwt from "jsonwebtoken";

const verifyToken = (token) => {
  jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
    if (err) {
      return { error: err.message };
    } else {
      return { data };
    }
  });
};

export default verifyToken;
