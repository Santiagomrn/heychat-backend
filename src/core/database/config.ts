import path from 'path';
import { config } from '../../config';
export const databaseConfigOptions = {
  ...config.db,
  dialectOptions: {
    ssl: {
      require: true,
    },
  },
  models: [path.join(__dirname + './../../modules/**/*.entity.*')],
  modelMatch: (filename, member) => {
    return (
      filename.substring(0, filename.indexOf('.entity')).toLowerCase() ===
      member.toLowerCase()
    );
  },
};
