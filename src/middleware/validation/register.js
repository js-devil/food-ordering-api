import Joi from "@hapi/joi";

const registration = (payload) => {
  try {
    const registerSchema = Joi.object({
      username: Joi.string().min(6).max(20).required(),
      phone: Joi.string().length(11),
      location: Joi.string().min(8),
      password: Joi.string().alphanum().min(6).max(20).required(),
    });

    const { username, phone, password, location } = payload;
    const { error, value } = registerSchema.validate({
      username,
      phone,
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

export default registration;
