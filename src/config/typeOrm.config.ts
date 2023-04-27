import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmConfigs = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    autoLoadEntities: true,
    synchronize: true,
    logging: false,
  };
};
