import dotenv from "dotenv";

dotenv.config();

class Config {
	public DATABASE_URL: string | undefined;
	public JWT_TOKEN: string | undefined;
	public NODE_ENV: string | undefined;
	public SECRET_KEY_ONE: string | undefined;
	public SECRET_KEY_TWO: string | undefined;
	public REDIS_HOST: string | undefined;

	private readonly DEFAULT_DATABASE_URL =
		"mongodb://localhost:27017/chatwave-backend";
	private readonly DEFAULT_REDIS_HOST = "http://localhost:6379";
	private readonly DEFAULT_JWT_TOKEN = "testtoken";
	private readonly DEFAULT_NODE_ENV = "dev";
	private readonly DEFAULT_SECRET_KEY_ONE = "firstsecret";
	private readonly DEFAULT_SECRET_KEY_TWO = "secondsecret";

	constructor() {
		this.DATABASE_URL =
			process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL;
		this.JWT_TOKEN = process.env.JWT_TOKEN || this.DEFAULT_JWT_TOKEN;
		this.NODE_ENV = process.env.NODE_ENV || this.DEFAULT_NODE_ENV;
		this.SECRET_KEY_ONE =
			process.env.SECRET_KEY_ONE || this.DEFAULT_SECRET_KEY_ONE;
		this.SECRET_KEY_TWO =
			process.env.SECRET_KEY_TWO || this.DEFAULT_SECRET_KEY_TWO;
		this.SECRET_KEY_TWO = process.env.REDIS_HOST || this.DEFAULT_REDIS_HOST;
	}

	public validate(): void {
		for (const [key, val] of Object.entries(this)) {
			if (val === undefined) {
				throw new Error(`Configuration undefined: ${key}`);
			}
		}
	}
}

export const config: Config = new Config();
