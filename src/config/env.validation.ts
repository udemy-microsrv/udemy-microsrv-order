import * as Joi from 'joi';

export default Joi.object({
  DATABASE_URL: Joi.string().required(),
  NATS_SERVERS: Joi.string()
    .required()
    .regex(/^([a-zA-Z]+:\/\/[^\s,]+)(,[a-zA-Z]+:\/\/[^\s,]+)*$/),
}).unknown(true);
