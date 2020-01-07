// import users from "./users";

const notFound = (req, res, next) => {
  return res.status(404).send({
    error: "Not found"
  });
};

const imageUpload = (req, res, next) => {
  // let formData = new FormData();
  // formData.append('image', req.body);
  // return res.status(200).send({
  //     form: formData
  // })
};

const errors = (err, req, res, next) => {
  return res.status(err.status || 500).send({
    error: err.message || "Something went wrong"
  });
};

const controllers = {
  // users,
  notFound,
  errors
};

export default controllers;
