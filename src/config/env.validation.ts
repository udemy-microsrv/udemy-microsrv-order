import * as Joi from 'joi';

export default Joi.object({
  PORT: Joi.number().required(),
  DATABASE_URL: Joi.string().required(),
  MICROSRV_PRODUCT_HOST: Joi.string().required(),
  MICROSRV_PRODUCT_PORT: Joi.number().required(),
}).unknown(true);
