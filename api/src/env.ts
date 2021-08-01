import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

export interface EnvironmentVariables {
  PORT : string;
  TYPEORM_CONNECTION : string;
  TYPEORM_HOST : string;
  TYPEORM_USERNAME : string;
  TYPEORM_PASSWORD : string;
  TYPEORM_DATABASE : string;
  TYPEORM_PORT : string;
  TYPEORM_SYNCHRONIZE : string;
  TYPEORM_LOGGING : string;
  TYPEORM_ENTITIES : string;
  TYPEORM_MIGRATIONS : string;
  TYPEORM_MIGRATIONS_DIR : string;
  TYPEORM_MIGRATIONS_TABLE_NAME : string;
  USE_HTTPS : string;
}

const environmentSchema = Joi.object<EnvironmentVariables>({
  PORT: Joi.string()
    .required(),

  TYPEORM_CONNECTION: Joi.string()
    .required(),

  TYPEORM_HOST: Joi.string()
    .required(),

  TYPEORM_USERNAME: Joi.string()
    .required(),

  TYPEORM_PASSWORD: Joi.string()
    .required(),

  TYPEORM_DATABASE: Joi.string()
    .required(),

  TYPEORM_PORT: Joi.string()
    .required(),

  TYPEORM_SYNCHRONIZE: Joi.string()
    .required(),

  TYPEORM_LOGGING: Joi.string()
    .required(),

  TYPEORM_ENTITIES: Joi.string()
    .required(),

  TYPEORM_MIGRATIONS: Joi.string()
    .required(),

  TYPEORM_MIGRATIONS_DIR: Joi.string()
    .required(),

  TYPEORM_MIGRATIONS_TABLE_NAME: Joi.string()
    .required(),

  USE_HTTPS : Joi.string()
    .allow("")
}).unknown();

const { value, error } = environmentSchema.validate(process.env);

if(error) {
  throw error;
}

export const env : EnvironmentVariables = value;