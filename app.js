import { getBrowser, getRandomElement, delay, checkMemoryCpu, getDomain } from './utils.js';
import { DOMAINS } from './modules/enums.js';
import otaghak from './modules/otaghak.js';
import { getPrice } from './db.js';
import connectToChannel, { pushToQueue } from './rabbitMQ.js';

// ============================================ Main
async function main() {
    let price;
    let browser;
    let page;
    const QUEUE = 'prices';

    console.time('Execution Time');
    try {
        price = await getPrice();

        if (price?.url) {
            await connectToChannel();

            const proxyList = [''];
            const randomProxy = getRandomElement(proxyList);

            // await delay(Math.random() * 4000);
            browser = await getBrowser(randomProxy, true, false);

            // ======================================================
            const page = await browser.newPage();
            await page.setRequestInterception(true);

            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // page.on('request', (request) => {
            //     if (request.resourceType() === 'image') {
            //         console.log('Blocking image request: ' + request.url());
            //         request.abort();
            //     } else {
            //         request.continue();
            //     }
            // });

            // ======================================================

            // const context = await browser.createIncognitoBrowserContext();
            // page = await context.newPage();

            // await page.evaluateOnNewDocument(() => {
            //     window.Notification.requestPermission = () => Promise.resolve('denied');
            // });

            await page.setViewport({ width: 1440, height: 810 });

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

            await pushToQueue(QUEUE, calendar);
        }
    } catch (error) {
        console.error('Error in main function:', error);
    } finally {
        console.timeEnd('Execution Time');
        console.log('End');

        if (page) await page.close();
        if (browser) await browser.close();
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
