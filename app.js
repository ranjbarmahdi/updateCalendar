import {
    getBrowser,
    getRandomElement,
    delay,
    checkMemoryCpu,
    getDomain,
    getPage,
} from './utils.js';
import { DOMAINS } from './modules/enums.js';
import otaghak from './modules/otaghak.js';
import { getPrice } from './db.js';
import connectToChannel, { pushToQueue } from './rabbitMQ.js';

// ============================================ Main
async function main() {
    let page;
    let price;
    let browser;
    const QUEUE = 'prices';

    try {
        // Create the browser instance once
        const proxyList = ['']; // Populate with valid proxies
        const randomProxy = getRandomElement(proxyList);
        browser = await getBrowser(randomProxy, true, false);

        while ((price = await getPrice()) !== null) {
            console.time('Execution Time');
            await connectToChannel();

            if (price?.url) {
                // Create a new page for each price
                page = await getPage(browser);
                const domain = getDomain(price.url);

                let calendar = [];
                switch (domain) {
                    case DOMAINS.OTAGHAK:
                        calendar = await otaghak(page, price);
                        break;
                    default:
                        console.log('Not Found Domain:', domain);
                        break;
                }

                // Push the result to the queue
                await pushToQueue(QUEUE, calendar);

                // Close the page after processing
                await page.close();
                console.timeEnd('Execution Time');
            }
        }
    } catch (error) {
        console.error('Error in main function:', error);
        if (page) await page.close();
        if (browser) await browser.close();
        process.exit(0);
    }
}

// ============================================ run_1
async function run_1(memoryUsagePercentage, cpuUsagePercentage, usageMemory) {
    if (checkMemoryCpu(memoryUsagePercentage, cpuUsagePercentage, usageMemory)) {
        await main();
    } else {
        const status = `status:
          memory usage = ${usageMemory}
          percentage of memory usage = ${memoryUsagePercentage}
          percentage of cpu usage = ${cpuUsagePercentage}\n`;

        console.log('main function does not run.\n');
        console.log(status);
    }
}

// ============================================ run_2
async function run_2(memoryUsagePercentage, cpuUsagePercentage, usageMemory) {
    let urlExists;

    do {
        urlExists = await getPrice();
        if (urlExists) {
            await run_1(memoryUsagePercentage, cpuUsagePercentage, usageMemory);
        }
    } while (urlExists);
}

run_1(80, 80, 20);
// run_2(80, 80, 20);
