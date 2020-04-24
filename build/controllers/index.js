"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// import users from "./users";

var notFound = function notFound(req, res, next) {
  return res.status(404).send({
    error: "Not found"
  });
};

var imageUpload = function imageUpload(req, res, next) {
  // let formData = new FormData();
  // formData.append('image', req.body);
  // return res.status(200).send({
  //     form: formData
  // })
};

var errors = function errors(err, req, res, next) {
  return res.status(err.status || 500).send({
    error: err.message || "Something went wrong"
  });
};

var controllers = {
  // users,
  notFound: notFound,
  errors: errors
};

exports.default = controllers;