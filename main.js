const puppeteer = require("puppeteer");
const path = require("path");
const dotenv = require("dotenv");

// env inject
(() => {
  const envConfig = dotenv.config({ path: ".env" }).parsed;

  if (!envConfig) {
    console.log("env file ??");
    process.exit(1);
  }
})();

const TEXT_USER_EMAIL = process.env.LOGIN_USER_EMAIL;
const TEXT_USER_PWD = process.env.LOGIN_USER_PWD;
const TEXT_URL = process.env.TEXT_AMAZON_URL;
const TEXT_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH;
const TEST_EXT_PATH = path.join(__dirname, process.env.RELATIVE_EXT_PATH);

// const TEST_EXT_PATH = require("path").join(
//   __dirname,
//   "/../../work/extension-pro/jsp/build/chrome"
// );

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: TEXT_EXECUTABLE_PATH,
    args: [
      `--disable-extensions-except=${TEST_EXT_PATH}`,
      `--load-extension=${TEST_EXT_PATH}`,
    ],
  });
  // find extension background target and load the page
  const extBackgroundTarget = await browser.waitForTarget(
    (t) => t.type() === "background_page"
  );
  const extBackgroundPage = await extBackgroundTarget.page();
  await extBackgroundPage.waitForTimeout(1000 * 3);

  const controlPage = await browser.newPage();
  await controlPage.goto(TEXT_URL);
  await controlPage.bringToFront();

  await controlPage.waitForSelector("#jsLoginPopup input[id=email]");
  // login input email and pwd
  await controlPage.focus("#jsLoginPopup input[id=email]");
  controlPage.keyboard.type(TEXT_USER_EMAIL);
  await controlPage.waitForTimeout(1000 * 1);
  await controlPage.focus("#jsLoginPopup input[id=password]");
  controlPage.keyboard.type(TEXT_USER_PWD);
  await controlPage.waitForTimeout(1000 * 1);
  // change event no work
  // await controlPage.$eval(
  //   "#jsLoginPopup input[id=email]",
  //   (ele, TEXT_USER_EMAIL) => {
  //     ele.value = TEXT_USER_EMAIL;
  //     const event = new Event("change");
  //     ele.dispatchEvent(event);
  //   },
  //   TEXT_USER_EMAIL
  // );
  // await controlPage.$eval(
  //   "#jsLoginPopup input[id=password]",
  //   (ele, TEXT_USER_PWD) => {
  //     ele.value = TEXT_USER_PWD;
  //     const event = new Event("change");
  //     ele.dispatchEvent(event);
  //   },
  //   TEXT_USER_PWD
  // );
  // logIn
  await controlPage.click("#jsLoginPopup button[type=submit]");
  // close modal
  await controlPage.waitForSelector("#jsxModals svg");
  await controlPage.click("#jsxModals svg");
  // count time => After logging in, the display is complete
  console.time("LoginAfterDispalyComplate");
  await controlPage.waitForTimeout(1000 * 1);
  await controlPage.waitForFunction(() => {
    const bts = document.querySelectorAll("#jsxMountElement button");
    const loadMoreBt = Array.from(bts).pop();
    return !loadMoreBt.disabled;
  });
  console.timeEnd("LoginAfterDispalyComplate");
  // await browser.close();
})();
