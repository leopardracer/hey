import dotenv from "dotenv";
import type { IDatabase, IFormatting, IHelpers, IMain } from "pg-promise";
import pgPromise from "pg-promise";
import type pg from "pg-promise/typescript/pg-subset";
import type { IConnectionParameters } from "pg-promise/typescript/pg-subset";

dotenv.config({ override: true });

type DatabaseInstance = IDatabase<unknown, pg.IClient>;

interface InitializeDbResult {
  instance: DatabaseInstance;
  pg: IMain<unknown, pg.IClient>;
}

type DatabaseParams = null | Record<string, any>;
type DatabaseQuery = string;

class Database {
  private _connectionBase: IConnectionParameters = {
    idleTimeoutMillis: 50000,
    max: 50,
    connectionString: process.env.LENS_DATABASE_URL
  };

  private _readDb: DatabaseInstance;
  public as: IFormatting;
  public helpers: IHelpers;

  constructor() {
    const readDb = this._initializeDb();
    this._readDb = readDb.instance;
    this.helpers = readDb.pg.helpers;
    this.as = readDb.pg.as;
  }

  private _initializeDb(): InitializeDbResult {
    return this._createDbInstance(this._connectionBase);
  }

  private _createDbInstance(
    connectionParameters: IConnectionParameters
  ): InitializeDbResult {
    const pgp = pgPromise({
      error: (error: any) => {
        const errorMessage = error.message || error;
        console.error(`LENS POSTGRES ERROR WITH TRACE: ${errorMessage}`);
      }
    });

    return {
      instance: pgp(connectionParameters),
      pg: pgp
    };
  }

  public multi(
    query: DatabaseQuery,
    params: DatabaseParams = null
  ): Promise<any[][]> {
    return this._readDb.multi(query, params);
  }

  public query(
    query: DatabaseQuery,
    params: DatabaseParams = null
  ): Promise<any[]> {
    return this._readDb.query(query, params);
  }
}

export default new Database();
