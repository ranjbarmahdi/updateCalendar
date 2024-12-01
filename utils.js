import puppeteer from 'puppeteer';
import os from 'os';

// ==================================== isNumeric
export const isNumeric = (string) => /^[+-]?\d+(\.\d+)?$/.test(string);

// ==================================== click
export function persionMonthToDigit(month) {
    const months = [
        'فروردین',
        'ازدیبهشت',
        'خرداد',
        'تیر',
        'مرداد',
        'شهریور',
        'مهر',
        'آبان',
        'آذر',
        'دی',
        'بهمن',
        'اسفند',
    ];
    return months.indexOf(month) + 1;
}

// ========================================= getDomain
export function getDomain(url) {
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname.replace(/^www./, '');
        return hostname;
    } catch (error) {
        console.error('Invalid URL:', error);
        return null;
    }
}

// ==================================== click
export async function click(page, selector) {
    try {
        let elements = await page.$$(selector);
        if (elements?.length) {
            let element = elements[0];
            await element.click();
        }
    } catch (error) {
        console.log('Error in click function :', error);
    }
}

//============================================ scrollToEnd
export async function scrollToEnd(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 3;
            const maxScrolls = 9999999; // You can adjust the number of scrolls

            const scrollInterval = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                // Stop scrolling after reaching the bottom or a certain limit
                if (totalHeight >= scrollHeight || totalHeight >= distance * maxScrolls) {
                    clearInterval(scrollInterval);
                    resolve();
                }
            }, 20); // You can adjust the scroll interval
        });
    });
}

//============================================ scrollModal
export const scrollModal = async (page, modalSelector, scrollAmount = 1, waitTime = 20) => {
    const modal = await page.$(modalSelector);
    if (!modal) {
        console.error(`Modal with selector "${modalSelector}" not found.`);
        return;
    }

    await page.evaluate(
        async (modalSelector, scrollAmount, waitTime) => {
            const modal = document.querySelector(modalSelector);
            if (!modal) {
                console.error(`Modal with selector "${modalSelector}" not found in the DOM.`);
                return;
            }

            await new Promise((resolve) => {
                let totalScrolled = 0;
                const scrollInterval = setInterval(() => {
                    const { scrollTop, scrollHeight, clientHeight } = modal;

                    // Scroll the modal by the specified amount
                    modal.scrollBy(0, scrollAmount);
                    totalScrolled += scrollAmount;

                    // Stop scrolling if the bottom of the modal is reached
                    if (scrollTop + clientHeight >= scrollHeight) {
                        clearInterval(scrollInterval);
                        resolve();
                    }
                }, waitTime); // Wait between scrolls
            });
        },
        modalSelector,
        scrollAmount,
        waitTime
    );

    console.log('Modal scrolling completed.');
};

//============================================ choose a random element from an array
export const getRandomElement = (array) => {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
};

//============================================ Login
export async function login(page, url, userOrPhone, pass) {
    try {
        await page.goto(url, { timeout: 360000 });

        let u = '09376993135';
        let p = 'hd6730mrm';
        // sleep 5 second
        console.log('-------sleep 5 second');
        await delay(5000);

        // load cheerio
        const html = await page.content();
        const $ = cheerio.load(html);

        const usernameInputElem = await page.$$('input#username');
        await page.evaluate((e) => (e.value = '09376993135'), usernameInputElem[0]);
        await delay(3000);

        const continueElem = await page.$$('.register_page__inner > button[type=submit]');
        await continueElem[0].click();
        await delay(3000);

        const passwordInputElem = await page.$$('input#myPassword');
        await passwordInputElem[0].type('hd6730mrm');
        // await page.evaluate((e) => e.value = "hd6730mrm" ,passwordInputElem[0]);
        await delay(3000);

        const enterElem = await page.$$('.register_page__inner > button[type=submit]');
        await enterElem[0].click();
        await delay(3000);
    } catch (error) {
        console.log('Error In login function', error);
    }
}

//============================================ convert To English Number
export function convertToEnglishNumber(inputNumber) {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    // Check if the input contains Persian numbers
    const containsPersianNumber = new RegExp(`[${persianNumbers.join('')}]`).test(inputNumber);

    if (containsPersianNumber) {
        // Convert Persian numbers to English numbers
        for (let i = 0; i < 10; i++) {
            const persianDigit = new RegExp(persianNumbers[i], 'g');
            inputNumber = inputNumber.replace(persianDigit, i.toString());
        }
        return inputNumber;
    } else {
        // Input is already an English number, return as is
        return inputNumber;
    }
}

// ============================================ getBrowser
export const getBrowser = async (proxyServer, headless = true, withProxy = true) => {
    try {
        const args = (withProxy) => {
            if (withProxy == true) {
                console.log('terue');
                return [
                    '--disable-notifications',
                    '--no-sandbox',
                    '--disable-infobars',
                    '--disable-setuid-sandbox',
                    '--disable-popup-blocking',
                    `--proxy-server=${proxyServer}`,
                ];
            } else {
                return ['--no-sandbox', '--disable-setuid-sandbox'];
            }
        };
        // Lunch Browser
        const browser = await puppeteer.launch({
            headless: headless, // Set to true for headless mode, false for non-headless
            executablePath:
                process.env.NODE_ENV === 'production'
                    ? process.env.PUPPETEER_EXECUTABLE_PATH
                    : puppeteer.executablePath(),
            args: args(withProxy),
            protocolTimeout: 6000000,
        });

        return browser;
    } catch (error) {
        console.log('Error in getBrowserWithProxy function', error);
    }
};

// ============================================ delay
export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ============================================ checkMemoryUsage
export function checkMemoryUsage() {
    const totalMemory = os.totalmem();
    const usedMemory = os.totalmem() - os.freemem();
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;
    return memoryUsagePercent;
}

// ============================================ getCpuUsagePercentage
export function getCpuUsagePercentage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
        for (let type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    });

    return (1 - totalIdle / totalTick) * 100;
}

// ============================================ checkMemoryCpu
export async function checkMemoryCpu(memoryUsagePercent, cpuUsagePercent, memoryUsageGig) {
    const usageMemory = (os.totalmem() - os.freemem()) / (1024 * 1024 * 1024);
    const memoryUsagePercentage = checkMemoryUsage();
    const cpuUsagePercentage = getCpuUsagePercentage();

    const cond_1 = memoryUsagePercentage <= memoryUsagePercent;
    const cond_2 = cpuUsagePercentage <= cpuUsagePercent;
    const cond_3 = usageMemory <= memoryUsageGig;
    return cond_1 && cond_2 && cond_3;
}
