import cheerio from 'cheerio';

import { convertToEnglishNumber, persionMonthToDigit, delay } from '../utils.js';

export default async function otaghak(page, priceRow) {
    let calendar = [];
    try {
        console.log(`======================== Start Scrape Calendaer From : \n${priceRow.url}\n`);

        // Go To Url
        await page.goto(priceRow.url, { timeout: 180000 });

        await page.evaluate(() => {
            document.body.querySelectorAll('*').forEach((el) => {
                if (!el.matches('.Calendar_container__AQwuE > div')) el.style.display = 'none';
            });
        });

        // await delay(2000);

        let html = await page.content();
        let $ = cheerio.load(html);

        $('.Calendar_container__AQwuE > div').map((i, e) => {
            let month = $(e).find('div:first > h4:first').text()?.trim();
            let year = $(e).find('div:first > h4:last').text()?.trim();
            const monthDigit = persionMonthToDigit(month);
            const yearDigit = convertToEnglishNumber(year);
            const reservable = $(e)
                .find('>div:last > div:not(.Day_block__CkEZ4)')
                .map((i, e) => {
                    const day = convertToEnglishNumber(
                        $(e).find('.Day_title__Lil75').text()?.trim()
                    );

                    let price = convertToEnglishNumber(
                        $(e)
                            .find('.Day_price__IWql3')
                            .text()
                            ?.replace(/[^\u06F0-\u06F90-9]/g, '')
                            ?.trim()
                    );
                    if (price) {
                        price *= 1000;
                    }

                    const date = `${yearDigit}\/${monthDigit}\/${day}`;

                    const available = !(
                        $(e).hasClass('Day_hafDay__86Xu5') || $(e).hasClass('Day_reserved__9_Jnt')
                    );

                    let isInstant = false;
                    if ($(e).find('img').length) {
                        isInstant = true;
                    }

                    const scrapedAt = new Date();
                    const AccomodationId = priceRow.AccomodationId;
                    const HostId = priceRow.HostId;

                    calendar.push({
                        date,
                        price,
                        available,
                        isInstant,
                        scrapedAt,
                        AccomodationId,
                        HostId,
                    });
                });
        });
    } catch (error) {
        console.log('Error In scrapCalendar in page.goto', error);
    } finally {
        return calendar;
    }
}
