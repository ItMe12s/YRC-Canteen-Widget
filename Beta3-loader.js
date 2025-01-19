// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: magic;

const username = "user";
const password = "pass";
const LOGIN_URL = "https://www.yupparaj.ac.th/canteen/login.php";
const LOGOUT_URL = "https://www.yupparaj.ac.th/canteen/logout.php";
const INFO_URL = "https://www.yupparaj.ac.th/canteen/index.php";
const REPORT_URL = "https://www.yupparaj.ac.th/canteen/report.php";
const LOGIN_API = "https://www.yupparaj.ac.th/canteen/api/login.php";
const update_rate = 5;
const Title = "( ◑‿◑)ɔ┏🍟--🍔┑٩(^◡^ )";
const SubText = "Original by Boatkungg | Modified by @sh1nxzql7";
const titleSize = 24;
const subtextSize = 8;
const listtextSize = 18;
const numberSize = 24;
const Include_Comma = false;
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/ItMe12s/YRC-Canteen-Widget/refs/heads/main/Beta3-code.js";

const config = {
  username, password, LOGIN_URL, LOGOUT_URL, INFO_URL, REPORT_URL, LOGIN_API,
  update_rate, Title, SubText, titleSize, subtextSize, listtextSize, numberSize, Include_Comma,
  runsInWidget: config.runsInWidget,
};

async function loadWidgetCode() {
  const req = new Request(GITHUB_RAW_URL);
  const code = await req.loadString();
  const runWidget = new Function("config", code);
  await runWidget(config);
}

await loadWidgetCode();
Script.complete();
