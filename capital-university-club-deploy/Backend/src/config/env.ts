import dotenv from 'dotenv';
import path from 'path';

const backendEnvPath = path.resolve(__dirname, '../../.env');

export function loadBackendEnv(): void {
  dotenv.config({ path: backendEnvPath, override: true });
}
