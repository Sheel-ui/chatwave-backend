import dotenv from 'dotenv';
import bunyan from 'bunyan';
import cloudinary from 'cloudinary';

dotenv.config();

class Config {
    public DATABASE_URL: string | undefined;
    public JWT_TOKEN: string | undefined;
    public NODE_ENV: string | undefined;
    public SECRET_KEY_ONE: string | undefined;
    public SECRET_KEY_TWO: string | undefined;
    public REDIS_HOST: string | undefined;
    public CLOUD_NAME: string | undefined;
    public CLOUD_API_KEY: string | undefined;
    public CLOUD_API_SECRET: string | undefined;

    private readonly DEFAULT_DATABASE_URL = 'mongodb://localhost:27017/chatwave-backend';
    private readonly DEFAULT_REDIS_HOST = 'http://localhost:6379';
    private readonly DEFAULT_JWT_TOKEN = 'testtoken';
    private readonly DEFAULT_NODE_ENV = 'dev';
    private readonly DEFAULT_SECRET_KEY_ONE = 'firstsecret';
    private readonly DEFAULT_SECRET_KEY_TWO = 'secondsecret';
    private readonly DEFAULT_CLOUD_NAME = '';
    private readonly DEFAULT_CLOUD_API_KEY = '';
    private readonly DEFAULT_CLOUD_API_SECRET = '';

    constructor() {
        this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL;
        this.JWT_TOKEN = process.env.JWT_TOKEN || this.DEFAULT_JWT_TOKEN;
        this.NODE_ENV = process.env.NODE_ENV || this.DEFAULT_NODE_ENV;
        this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || this.DEFAULT_SECRET_KEY_ONE;
        this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || this.DEFAULT_SECRET_KEY_TWO;
        this.REDIS_HOST = process.env.REDIS_HOST || this.DEFAULT_REDIS_HOST;
        this.CLOUD_NAME = process.env.CLOUD_NAME || this.DEFAULT_CLOUD_NAME;
        this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || this.DEFAULT_CLOUD_API_KEY;
        this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || this.DEFAULT_CLOUD_API_SECRET;
    }

    public createLogger(name: string): bunyan {
        return bunyan.createLogger({ name, level: 'debug' });
    }

    public validate(): void {
        for (const [key, val] of Object.entries(this)) {
            if (val === undefined) {
                throw new Error(`Configuration undefined: ${key}`);
            }
        }
    }

    public cloudinaryConfig(): void {
        cloudinary.v2.config({
            cloud_name: this.CLOUD_NAME,
            api_key: this.CLOUD_API_KEY,
            api_secret: this.CLOUD_API_SECRET
        });
    }
}

export const config: Config = new Config();
