// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: magic;

// IMPORTANT SETTINGS
// The settings and variables are now dynamically loaded from the config.

async function getCurrentPage(config) {
	const request = new Request(config.LOGIN_URL);
	const response = await request.loadString();

	if (request.response.statusCode === 200) {
		const currentURL = request.response.url;
		var currentPage = 0;
		if (currentURL === config.INFO_URL) {
			currentPage = 2;
		} else if (currentURL === config.LOGIN_URL) {
			currentPage = 1;
		} else {
			return undefined;
		}

		return [currentPage, response, request.response];
	}

	return undefined;
}

async function getCSRF(html) {
	const webView = new WebView();
	await webView.loadHTML(html);

	const jsGetCSRF = 'document.getElementsByName("csrf_token")[0].value';
	const CSRF = await webView.evaluateJavaScript(jsGetCSRF);

	return CSRF;
}

async function Login(config, cookie, csrf_token) {
	const request = new Request(config.LOGIN_API);
	request.method = "POST";

	request.headers = {
		"Cookie": `PHPSESSID=${cookie}`,
	};
	request.body = `username=${config.username}&password=${config.password}&csrf_token=${csrf_token}&Login=`;

	const response = await request.loadString();

	if (request.response.statusCode === 200) {
		return [response, request.response];
	}

	return undefined;
}

async function Logout(config, cookie) {
	const request = new Request(config.LOGOUT_URL);
	request.method = "POST";

	request.headers = {
		"Cookie": `PHPSESSID=${cookie}`,
	};
	var response = await request.loadString();
	log(response);
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

function parseValue(config, value) {
	if (config.Include_Comma == true) {
		return value;
	} else {
		return parseFloat(value.replace(",", ""));
	}
}

async function getInfo(config) {
	let [a, b, c] = await getCurrentPage(config);

	const session = c.cookies.find(cookie => cookie.name === "PHPSESSID").value;
	log(session);

	if (a === 1) {
		const csrf = await getCSRF(b);
		[b, c] = await Login(config, session, csrf);
		a = 2;
	}

	let [bal, top, exp] = ["0", "0", "0"];
	if (a === 2) {
		[bal, top, exp] = await getValues(b);
		bal = Number(parseValue(config, bal).toFixed(2)).toString();
		top = Number(parseValue(config, top).toFixed(2)).toString();
		exp = Number(parseValue(config, exp).toFixed(2)).toString();
		log(bal);
		log(top);
		log(exp);
	}

	return [bal, top, exp];
}

async function createWidget(config) {
	let listWidget = new ListWidget();
	listWidget.refreshAfterDate = new Date(Date.now() + 60000 * config.update_rate);

	const [bal, top, exp] = await getInfo(config);

	const headingColor = Color.dynamic(Color.black(), Color.white());
	const textColor = Color.dynamic(Color.darkGray(), Color.lightGray());
	const balColor = Color.dynamic(new Color("#10b981"), new Color("34d399"));
	const topColor = Color.dynamic(new Color("#3b82f6"), new Color("#60a5fa"));
	const expColor = Color.dynamic(new Color("#ef4444"), new Color("#f87171"));

	var heading1 = listWidget.addText(config.Title);
	heading1.font = Font.boldSystemFont(config.titleSize);
	heading1.textColor = headingColor;

	var heading2 = listWidget.addText(config.SubText);
	heading2.font = Font.boldSystemFont(config.subtextSize);
	heading2.textColor = headingColor;

	listWidget.addSpacer();

	const stack = listWidget.addStack();

	listWidget.addSpacer(12);

	const balStack = stack.addStack();
	balStack.layoutVertically();
	balStack.topAlignContent();

	stack.addSpacer();

	const topStack = stack.addStack();
	topStack.layoutVertically();
	topStack.centerAlignContent();

	stack.addSpacer();

	const expStack = stack.addStack();
	expStack.layoutVertically();
	expStack.centerAlignContent();

	var balanceHeading = balStack.addText("💰 Balance");
	balanceHeading.centerAlignText();
	balanceHeading.font = Font.lightSystemFont(config.listtextSize);
	balanceHeading.textColor = textColor;

	balStack.addSpacer(4);

	var balance = balStack.addText(bal);
	balance.centerAlignText();
	balance.font = Font.lightSystemFont(config.numberSize);
	balance.textColor = balColor;

	var topUpHeading = topStack.addText("📊 Top-Up");
	topUpHeading.centerAlignText();
	topUpHeading.font = Font.lightSystemFont(config.listtextSize);
	topUpHeading.textColor = textColor;

	topStack.addSpacer(4);

	var topUp = topStack.addText(top);
	topUp.centerAlignText();
	topUp.font = Font.lightSystemFont(config.numberSize);
	topUp.textColor = topColor;

	var expenseHeading = expStack.addText("💸 Expense");
	expenseHeading.centerAlignText();
	expenseHeading.font = Font.lightSystemFont(config.listtextSize);
	expenseHeading.textColor = textColor;

	expStack.addSpacer(4);

	var expense = expStack.addText(exp);
	expense.centerAlignText();
	expense.font = Font.lightSystemFont(config.numberSize);
	expense.textColor = expColor;

	return listWidget;
}

// Start the widget
const config = await loadWidgetConfig(); // Load config dynamically from GitHub
const widget = await createWidget(config);
if (config.runsInWidget) {
	Script.setWidget(widget);
} else {
	widget.presentMedium();
}
Script.complete();
