import Joi from "@hapi/joi";

const newMenu = payload => {
  try {
    const foodItemSchema = Joi.object({
      name: Joi.string()
        .min(6)
        .max(200)
        .required(),
      quantity: Joi.string().required(),
      price: Joi.string().required(),
      category: Joi.string()
        .min(4)
        .max(200)
        .required(),
      status: Joi.string()
        .min(6)
        .max(200)
        .required(),
      image_url: Joi.string()
        .min(6)
        .max(200)
    });

    const { name, quantity, price, category, status, image_url } = payload;
    const { error, value } = foodItemSchema.validate({
      name,
      quantity,
      price,
      category,
      status,
      image_url
    });

    if (error === undefined || typeof error === "undefined") {
      return { success: value };
    } else {
      const errorMsg = error.details.map(errorObject => errorObject.message);
      return { failed: errorMsg };
    }
  } catch (e) {
    return { error: e.message, trace: e.stack };
  }
};

export default newMenu;
