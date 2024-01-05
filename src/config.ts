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
    public SENDER_EMAIL: string | undefined;
    public SENDER_EMAIL_PASSWORD: string | undefined;
    public SENDGRID_API_KEY: string | undefined;
    public SENDER_SENDER: string | undefined;
    public CLIENT_URL: string | undefined;

    private readonly DEFAULT_DATABASE_URL = 'mongodb://localhost:27017/chatwave-backend';
    private readonly DEFAULT_REDIS_HOST = 'http://localhost:6379';
    private readonly DEFAULT_JWT_TOKEN = 'testtoken';
    private readonly DEFAULT_NODE_ENV = 'dev';
    private readonly DEFAULT_SECRET_KEY_ONE = 'firstsecret';
    private readonly DEFAULT_SECRET_KEY_TWO = 'secondsecret';
    private readonly DEFAULT_CLOUD_NAME = '';
    private readonly DEFAULT_CLOUD_API_KEY = '';
    private readonly DEFAULT_CLOUD_API_SECRET = '';
    private readonly DEFAULT_SENDER_EMAIL = '';
    private readonly DEFAULT_SENDER_EMAIL_PASSWORD = '';
    private readonly DEFAULT_SENDGRID_API_KEY = '';
    private readonly DEFAULT_SENDER_SENDER = '';
    private readonly DEFAULT_CLIENT_URL = 'http://localhost:3000';

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
        this.SENDER_EMAIL = process.env.SENDER_EMAIL || this.DEFAULT_SENDER_EMAIL;
        this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD || this.DEFAULT_SENDER_EMAIL_PASSWORD;
        this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || this.DEFAULT_SENDGRID_API_KEY;
        this.SENDER_SENDER = process.env.SENDER_SENDER || this.DEFAULT_SENDER_SENDER;
        this.CLIENT_URL = process.env.CLIENT_URL || this.DEFAULT_CLIENT_URL;
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
