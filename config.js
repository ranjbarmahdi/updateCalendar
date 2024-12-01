// database.js
import mysql from 'mysql2/promise';

class Database {
    constructor() {
        if (!Database.instance) {
            this.connection = null;
            Database.instance = this;
        }

        return Database.instance;
    }

    async connect() {
        if (!this.connection) {
            try {
                this.connection = await mysql.createConnection({
                    host: '5.75.206.157',
                    user: 'root',
                    password: 'safartick@hd6730mrm',
                    database: 'safartick',
                    port: 3307,
                    // rowsAsArray: true,
                    // decimalNumbers: true
                });
                console.log('Database connected successfully');
            } catch (error) {
                console.error('Database connection failed:', error);
                throw error;
            }
        }
        return this.connection;
    }
}

const instance = new Database();

async function getConnection() {
    await instance.connect();
    return instance.connection;
}

const conection = await getConnection();

export default conection;
