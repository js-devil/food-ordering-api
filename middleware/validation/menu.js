import Joi from "@hapi/joi";

const newMenu = (payload) => {
  try {
    const foodItemSchema = Joi.object({
      name: Joi.string().min(6).max(30).required(),
      quantity: Joi.number().max(200).required(),
      price: Joi.number().min(50).max(200).required(),
      category: Joi.string().min(4).max(30).required(),
      status: Joi.string().min(6).max(30).required(),
      image_url: Joi.string().uri().lowercase(),
    });

    const { name, quantity, price, category, status, image_url } = payload;
    const { error, value } = foodItemSchema.validate({
      name,
      quantity,
      price,
      category,
      status,
      image_url,
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

export default newMenu;
