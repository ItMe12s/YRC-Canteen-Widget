// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: magic;

// IMPORTANT SETTINGS
const username = "00000"; // your username here
const password = "12345"; // your password here

// URL AND API ENDPOINTS, change if yrc update in the future.
// url
const LOGIN_URL = "https://www.yupparaj.ac.th/canteen/login.php";
const LOGOUT_URL = "https://www.yupparaj.ac.th/canteen/logout.php";
const INFO_URL = "https://www.yupparaj.ac.th/canteen/index.php";
const REPORT_URL = "https://www.yupparaj.ac.th/canteen/report.php"; // to-do update 2.0
// api
const LOGIN_API = "https://www.yupparaj.ac.th/canteen/api/login.php";

// update rate in minutes; Keep above 1 min.
const update_rate = 5;

// Top Bar Text and customization
const Title = "( ◑‿◑)ɔ┏🍟--🍔┑٩(^◡^ )";
const SubText = "Original by Boatkungg | Modified by @sh1nxzql7";

// font size
const titleSize = 24;
const subtextSize = 8;
// text and display font size
const listtextSize = 18;
const numberSize = 24;

// Comma filter
const Include_Comma = false;

// CODE
// DO NOT MODIFY IF YOUR DON'T KNOW WHAT YOU'RE DOING.
// please use the latest on github repo.

// can bypass.
async function checkForUpdate() {
	const url = "https://raw.githubusercontent.com/ItMe12s/YRC-Canteen-Widget/refs/heads/main/version.json";
	const req = new Request(url);
	const versionData = await req.loadJSON();
	const latestVersion = versionData.version;
	// set this to the latest version to ignore updates
	const currentVersion = "1.0.0";

	if (currentVersion !== latestVersion) {
		const updateUrl = "https://github.com/ItMe12s/YRC-Canteen-Widget/releases";
		const alert = new Alert();
		alert.title = "Update Available";
		alert.message = "A new version (${latestVersion}) is available. Visit GitHub to update.";
		alert.addAction("Open Github");
		alert.addCancelAction("No thanks");
		const response = await alert.present();

		if (response === 0) {
			Safari.open(updateUrl);
		}
	} else {
		console.log("You are using the latest version.");
	}
}

// page info login/main/etc.
async function getCurrentPage() {
	const request = new Request(LOGIN_URL);
	const response = await request.loadString();

	if (request.response.statusCode === 200) {
		const currentURL = request.response.url;
		//throw new Error(currentURL);
		var currentPage = 0;
		if (currentURL === INFO_URL) {
			currentPage = 2;
		} else if (currentURL === LOGIN_URL) {
			currentPage = 1;
		} else {
			return undefined;
		}

		return [currentPage, response, request.response];
	}

	return undefined;
}

// simple
async function getCSRF(html) {
	const webView = new WebView();
	await webView.loadHTML(html);

	const jsGetCSRF = 'document.getElementsByName("csrf_token")[0].value';
	const CSRF = await webView.evaluateJavaScript(jsGetCSRF);

	return CSRF;
}

// to-do, add relogin failsafe
async function Login(cookie, csrf_token) {
	const request = new Request(LOGIN_API);
	request.method = "POST";
	// throw new Error(csrf_token);

	request.headers = {
		"Cookie": `PHPSESSID=${cookie}`,
	}
	request.body = `username=${username}&password=${password}&csrf_token=${csrf_token}&Login=`;

	const response = await request.loadString();

	if (request.response.statusCode === 200) {
		return [response, request.response];
	}

	return undefined;
}

// Go to logout/reset cookie
async function Logout(cookie) {
	const request = new Request(LOGOUT_URL);
	request.method = "POST";

	request.headers = {
		"Cookie": `PHPSESSID=${cookie}`,
	}
	var response = await request.loadString();
	log(response);
}

// good now
function getValueNumber(number) {
	return `document.getElementsByClassName('inner')[${number}].getElementsByTagName('h3')[0].textContent`;
}

// call getValueNumber then return an array.
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

// Remove comma and other stuff (none rn)
function parseValue(value) {
	if (Include_Comma == true) {
		return value;
	} else {
		return parseFloat(value.replace(",", ""));
	}
}

// balance info table
async function getInfo() {
	let [a, b, c] = await getCurrentPage();

	const session = c.cookies.find(cookie => cookie.name === "PHPSESSID").value;
	log(session);

	if (a === 1) { // stict
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
		log(bal);
		log(top);
		log(exp);
	}

	return [bal, top, exp];
}

// MAIN ENTRY POINT
async function createWidget() {
	let listWidget = new ListWidget();
	listWidget.refreshAfterDate = new Date(Date.now() + 60000 * update_rate);
	// UPDATE CHECK STARTS HERE!!!
	checkForUpdate();

	const [bal, top, exp] = await getInfo();

	// DISPLAY COLOR
	const headingColor = Color.dynamic(Color.black(), Color.white());
	const textColor = Color.dynamic(Color.darkGray(), Color.lightGray());
	const balColor = Color.dynamic(new Color("#10b981"), new Color("34d399"));
	const topColor = Color.dynamic(new Color("#3b82f6"), new Color("#60a5fa"));
	const expColor = Color.dynamic(new Color("#ef4444"), new Color("#f87171"));

	// TITLE AND TEXT CONFIG
	var heading1 = listWidget.addText(Title);
	heading1.font = Font.boldSystemFont(titleSize);
	heading1.textColor = headingColor;

	var heading2 = listWidget.addText(SubText);
	heading2.font = Font.boldSystemFont(subtextSize);
	heading2.textColor = headingColor;

	listWidget.addSpacer();

	const stack = listWidget.addStack();

	listWidget.addSpacer(12);

	// BALANCE STACK
	const balStack = stack.addStack();
	balStack.layoutVertically();
	balStack.topAlignContent();

	stack.addSpacer();

	// TOP STACK
	const topStack = stack.addStack();
	topStack.layoutVertically();
	topStack.centerAlignContent();

	stack.addSpacer();

	// EXPENSE STACK
	const expStack = stack.addStack();
	expStack.layoutVertically();
	expStack.centerAlignContent();

	// Balance display
	var balanceHeading = balStack.addText("💰 Balance");
	balanceHeading.centerAlignText();
	balanceHeading.font = Font.lightSystemFont(listtextSize);
	balanceHeading.textColor = textColor;

	balStack.addSpacer(4);

	var balance = balStack.addText(bal);
	balance.centerAlignText();
	balance.font = Font.lightSystemFont(numberSize);
	balance.textColor = balColor;

	// Top up display
	var topUpHeading = topStack.addText("📊 Top-Up");
	topUpHeading.centerAlignText();
	topUpHeading.font = Font.lightSystemFont(listtextSize);
	topUpHeading.textColor = textColor;

	topStack.addSpacer(4);

	var topUp = topStack.addText(top);
	topUp.centerAlignText();
	topUp.font = Font.lightSystemFont(numberSize);
	topUp.textColor = topColor;

	// expense display
	var expenseHeading = expStack.addText("💸 Expense");
	expenseHeading.centerAlignText();
	expenseHeading.font = Font.lightSystemFont(listtextSize);
	expenseHeading.textColor = textColor;

	expStack.addSpacer(4);

	var expense = expStack.addText(exp);
	expense.centerAlignText();
	expense.font = Font.lightSystemFont(numberSize);
	expense.textColor = expColor;

	// END OF MAIN
	return listWidget;
}

let widget = await createWidget();
if (config.runsInWidget) {
	Script.setWidget(widget);
} else {
	widget.presentMedium();
}
Script.complete();
