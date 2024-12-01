import db from './config.js';

// ========================================= getPrice
export async function getPrice() {
    try {
        const selectQuery = `SELECT *  FROM AccomodationPrices ap 
            where validUntil < NOW() AND availible = TRUE
            ORDER BY RAND() limit 1`;
        const [rows, _] = await db.query(selectQuery);
        return rows[0];
    } catch (error) {
        console.error('Error getPrice:', error);
        throw error;
    }
}
