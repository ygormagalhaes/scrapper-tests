import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import * as rp from 'request-promise';
import * as fs from 'fs';

// tslint:disable-next-line: max-line-length
const SEARCH_URL = 'https://www.google.com/search?tbm=isch&source=hp&biw=1920&bih=981&ei=0iINXZi3M8e-5OUPsvWI2AM&q=guaruja&oq=guaruja&gs_l=img.3..0l10.31040.32203..32638...0.0..0.143.683.5j2......0....1..gws-wiz-img.....0.KYDuY9Gw0uQ';

puppeteer
    .launch()
    .then(browser => {
        return browser.newPage();
    })
    .then(page => {
        return page.goto(SEARCH_URL).then(() => page.content());
    })
    .then(html => handleHtmlContent(html));

function handleHtmlContent(html: string) {
    const $ = cheerio.load(html);
    const rawImagensInfo = $('div.notranslate');
    const imagePromises = [];

    for (let index = 0; index < rawImagensInfo.length; index++) {
        const rawImagemInfo = rawImagensInfo.eq(index);
        const imageData = JSON.parse(rawImagemInfo.text());
        imagePromises.push(rp.get(imageData.ou, { encoding: null }, (err, res, body) => {
            fs.writeFile(`/tmp/scrapper/${imageData.id}`, body, err => {
                if (err) {
                    console.error(err);
                    console.log(`Erro ao salvar img ${imageData.id}`);
                }
            });
        }));
    }

    Promise.all(imagePromises).then(() => {
        console.log('Tarefa finalizada.');
    }).catch(err => {
        console.log('Erro ao executar a tarefa');
    });
}
