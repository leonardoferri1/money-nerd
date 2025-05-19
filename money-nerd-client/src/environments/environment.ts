export interface Environment {
  production: boolean;
  apiUrl: string;
  enableDebug: boolean;
}

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  enableDebug: true,
};
