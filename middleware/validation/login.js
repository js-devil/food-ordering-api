import Joi from "@hapi/joi";

const login = (payload) => {
  try {
    const loginSchema = Joi.object({
      username: Joi.string().min(6).max(20).required(),
      password: Joi.string().alphanum().min(6).max(20).required(),
      location: Joi.string().min(8),
    });

    const { username, password, location } = payload;
    const { error, value } = loginSchema.validate({
      username,
      password,
      location,
    });

    if (error === undefined || typeof error === "undefined") {
      return { success: value };
    } else {
      const errorMsg = error.details.map((errorObject) => errorObject.message);
      return { failed: errorMsg };
    }
  } catch (e) {
    return { error: e.message, trace: e.stack };
  }
};

export default login;
