import { ConfigService } from '@nestjs/config';
import { TYPEORM_CONFIG } from '../config/constants';
import fs = require('fs');

/**
 * This script will generate the ormconfig.json based on your global config
 * @param config Config Service for accessing the ENV variables
 */

const generateTypeOrmConfigFile = (config: ConfigService) => {
  const typeormConfig = config.get(TYPEORM_CONFIG);
  fs.writeFileSync('ormconfig.json', JSON.stringify(typeormConfig, null, 2));
};

export default generateTypeOrmConfigFile;
