const puppeteer = require('puppeteer');
const userAgents = require('user-agents');
const randomstring = require("randomstring");
const PuppeteerNetworkMonitor = require('./request-monitor');

const URL_CHOROS = 'http://pchincha1406b.byethost33.com/?i=1';

const MAIL_DOMAINS = ['gobierno.gob.ec','gmail.com.ec','gmail.com', 'gmail.es', 'hotmail.com', 'outlook.com','outlook.es', 'hotmail.es', 'yahoo.com'];

const TAKE_SCREENSHOT = false;
// max excluyente
const  getRandomInt =  (min, max) =>{
    return Math.floor(Math.random() * (max - min)) + min;
  }

const sendFakeData = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const userAgent = new userAgents();

    await page.setUserAgent(userAgent.toString());
    await page.goto(URL_CHOROS);
    //await page.click('#fcr');
    //await page.waitForSelector('#fcr');
    try {
        await page.evaluate(() => {
            document.querySelectorAll('#fcr')[1].click();
        });
    } catch (error) {
        console.error('error al generar form');
    }


    await page.waitForSelector('#edt1');

    const usernameFake = randomstring.generate({
        length: getRandomInt(8, 17),
        charset: 'alphanumeric'
    });
    
    console.log(usernameFake);
    const pwdFake = randomstring.generate({
        length: getRandomInt(8, 17),
        charset: 'alphanumeric'
    });

    await page.$eval('#edt1', (el, value) => el.value = value, usernameFake);
    await page.$eval('#edt2', (el, value) => el.value = value, pwdFake);
    if(TAKE_SCREENSHOT){

        await page.screenshot({ path: 'pagina1.png' });
    }
    await page.$eval('#btn1', (el) => el.click());
    
    try {
        // enable this here because we don't want to watch the initial page asset requests (which page.goto above triggers) 
        await page.setRequestInterception(true);
        // custom version of pending-xhr-puppeteer module
        let monitorRequests = new PuppeteerNetworkMonitor(page);
        await monitorRequests.waitForAllRequests();
        await page.waitForNavigation({
            timeout: 5000,
            waitUntil: 'networkidle0'
        });

        
    } catch (error) {
        
    }
    
    try {
        await page.waitForSelector('#fcr');

        await page.evaluate(() => {
            document.querySelectorAll('#fcr')[1].click();
        });

        const emailFake = randomstring.generate({
            length: getRandomInt(8, 17),
            charset: 'alphanumeric'
        });

        const pwdFakeMail = randomstring.generate({
            length: getRandomInt(8, 17),
            charset: 'alphanumeric'
        });
        await page.waitForSelector('#edt3');
        await page.$eval('#edt3', (el, value) => el.value = value, `${emailFake}@${MAIL_DOMAINS[getRandomInt(0,MAIL_DOMAINS.length)]}`);
        await page.$eval('#edt4', (el, value) => el.value = value, pwdFakeMail);
        if(TAKE_SCREENSHOT){
            await page.screenshot({ path: 'pagina2.png' });
        }
        await page.$eval('#btn1', (el) => el.click());
        await browser.close();
        console.log('choros timados :)');

    } catch (error) {
        console.error('error al enviar datos a los choros');
    }

  };

  //sendFakeData();
  const intervalTime = 6 * 1000;
  setInterval(sendFakeData, intervalTime);