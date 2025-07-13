import { ConfigType } from '@nestjs/config';
import { appConfig } from './app.config';
import { dbConfig } from './db.config';

// export interface IConfig {
//   app: ConfigType<typeof appConfig>;
//   db: ConfigType<typeof dbConfig>;
// }

export type IAppConfig = ConfigType<typeof appConfig>;
export type IDbConfig = ConfigType<typeof dbConfig>;
