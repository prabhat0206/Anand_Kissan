namespace NodeJS {
  interface ProcessEnv extends NodeJS.ProcessEnv {
    AUTH: string;
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD: string;
    RZZ_KEY: string;
    RZ_SECRET: string;
    SECRET_KEY: string;
  }
}
