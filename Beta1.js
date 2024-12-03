// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// always-run-in-app: true; icon-color: light-gray;
// icon-glyph: magic;
const username = "u";
const password = "p";

const update_rate = 1;

const BigText = "Canteen Balance";

function setBackgroundGradient(widget, balance) {
  let gradient;

  if (balance >= 75) {
    gradient = new LinearGradient();
    gradient.colors = [new Color("#34D399"), new Color("#10B981")];
    gradient.locations = [0, 1];
  } else if (balance < 9) {
    gradient = new LinearGradient();
    gradient.colors = [new Color("#EF4444"), new Color("#B91C1C")];
    gradient.locations = [0, 1];
  } else {
    gradient = new LinearGradient();
    gradient.colors = [new Color("#3B82F6"), new Color("#2563EB")];
    gradient.locations = [0, 1];
  }

  widget.backgroundGradient = gradient;
}

async function getCurrentPage() {
  const url = "https://www.yupparaj.ac.th/canteen/login.php";
  const request = new Request(url);
  const response = await request.loadString();

  if (request.response.statusCode === 200) {
    const currentURL = request.response.url;
    if (currentURL === "https://www.yupparaj.ac.th/canteen/index.php") {
      return [2, response, request.response];
    } else if (currentURL === "https://www.yupparaj.ac.th/canteen/login.php") {
      return [1, response, request.response];
    }
  }
  return undefined;
}

async function getCSRF(html) {
  const webView = new WebView();
  await webView.loadHTML(html);
  const jsGetCSRF = `document.getElementsByName('csrf_token')[0].value`;
  const CSRF = await webView.evaluateJavaScript(jsGetCSRF);
  return CSRF;
}

async function Login(cookie, csrf_token) {
  const url = "https://www.yupparaj.ac.th/canteen/api/login.php";
  const request = new Request(url);
  request.method = "POST";
  request.headers = { "Cookie": `PHPSESSID=${cookie}` };
  request.body = `username=${username}&password=${password}&csrf_token=${csrf_token}&Login=`;
  const response = await request.loadString();
  return response;
}

function getValueNumber(number) {
  return `document.getElementsByClassName('inner')[${number}].getElementsByTagName('h3')[0].textContent`;
}

async function getValues(html) {
  const webView = new WebView();
  await webView.loadHTML(html);

  const jsGetBalance = getValueNumber(0);
  const balance = await webView.evaluateJavaScript(jsGetBalance);

  const jsGetTopUp = getValueNumber(1);
  const topUp = await webView.evaluateJavaScript(jsGetTopUp);

  const jsGetExpense = getValueNumber(2);
  const expense = await webView.evaluateJavaScript(jsGetExpense);

  return [balance, topUp, expense];
}

function parseValue(value) {
  return parseFloat(value.replace(",", ""));
}

async function getInfo() {
  let [a, b, c] = await getCurrentPage();
  const session = c.cookies.find(cookie => cookie.name === "PHPSESSID").value;

  if (a === 1) {
    const csrf = await getCSRF(b);
    [b, c] = await Login(session, csrf);
    a = 2;
  }

  let [bal, top, exp] = ["0", "0", "0"];
  if (a === 2) {
    [bal, top, exp] = await getValues(b);
    bal = Number(parseValue(bal).toFixed(2)).toString();
    top = Number(parseValue(top).toFixed(2)).toString();
    exp = Number(parseValue(exp).toFixed(2)).toString();
  }

  return [bal, top, exp];
}

function createGlowingText(widget, text, color, fontSize) {
  let textElement = widget.addText(text);
  textElement.font = Font.boldSystemFont(fontSize);
  textElement.textColor = color;

  textElement.shadowColor = color;
  textElement.shadowRadius = 8;
  textElement.shadowOffset = new Point(0, 0);

  return textElement;
}

function createCoolFramedText(stack, label, value, labelColor, valueColor, gradientColors) {
  const frameStack = stack.addStack();
  frameStack.layoutVertically();
  frameStack.centerAlignContent();
  frameStack.setPadding(8, 8, 8, 8);
  frameStack.cornerRadius = 10;

  const gradient = new LinearGradient();
  gradient.colors = gradientColors;
  gradient.locations = [0, 1];
  frameStack.backgroundGradient = gradient;

  frameStack.shadowColor = Color.dynamic(new Color("#000000", 0.5), new Color("#000000", 0.8));
  frameStack.shadowOffset = new Point(4, 4);
  frameStack.shadowRadius = 12;

  createGlowingText(frameStack, label, labelColor, 14);
  frameStack.addSpacer(4);
  createGlowingText(frameStack, value, valueColor, 20);

  return frameStack;
}

async function createWidget() {
  let listWidget = new ListWidget();
  listWidget.refreshAfterDate = new Date(Date.now() + 60000 * update_rate);

  const [bal, top, exp] = await getInfo();

  const headingColor = Color.dynamic(Color.black(), Color.white());
  const textColor = Color.dynamic(Color.darkGray(), Color.lightGray());
  const balColor = new Color("#064E3B");
  const topColor = new Color("#1E3A8A");
  const expColor = new Color("#7F1D1D");
  const labelColor = new Color("#333333");

  setBackgroundGradient(listWidget, parseFloat(bal));

  createGlowingText(listWidget, BigText, headingColor, 37);

  listWidget.addSpacer();

  const stack = listWidget.addStack();
  stack.layoutHorizontally();

  createCoolFramedText(stack, "💰 Balance", bal, labelColor, balColor, [new Color("#D1FAE5"), new Color("#10B981")]);

  stack.addSpacer();

  createCoolFramedText(stack, "📊 Lifetime", top, labelColor, topColor, [new Color("#DBEAFE"), new Color("#3B82F6")]);

  stack.addSpacer();

  createCoolFramedText(stack, "💸 Spent", exp, labelColor, expColor, [new Color("#FEE2E2"), new Color("#EF4444")]);

  return listWidget;
}

let widget = await createWidget();

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}

Script.complete();