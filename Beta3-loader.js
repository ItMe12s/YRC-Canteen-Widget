// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: magic;

// IMPORTANT SETTINGS
const username = "user"; // your username here
const password = "pass"; // your password here

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

// GitHub raw URL
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/ItMe12s/YRC-Canteen-Widget/refs/heads/main/Beta3-code.js";

// Loader function to fetch and execute the code
async function loadWidgetCode() {
  try {
    const req = new Request(GITHUB_RAW_URL);
    const code = await req.loadString();

    // Safely evaluate the loaded code
    const runWidget = new Function("config", "createWidget", code);

    // Execute the widget code
    const widget = await runWidget(config, createWidget);

    // Display the widget
    if (config.runsInWidget) {
      Script.setWidget(widget);
    } else {
      widget.presentMedium();
    }

    Script.complete();
  } catch (error) {
    console.error("Failed to load widget code:", error);

    // Fallback widget
    const fallbackWidget = await createFallbackWidget();
    if (config.runsInWidget) {
      Script.setWidget(fallbackWidget);
    } else {
      fallbackWidget.presentMedium();
    }

    Script.complete();
  }
}

// Fallback widget function
async function createFallbackWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#222222");

  const title = widget.addText("Failed to Load Widget");
  title.textColor = Color.white();
  title.font = Font.boldSystemFont(16);

  widget.addSpacer();

  const subText = widget.addText("Please check your GitHub URL.");
  subText.textColor = Color.red();
  subText.font = Font.systemFont(12);

  return widget;
}

// Local configuration object
const config = {
  username,
  password,
  LOGIN_URL,
  LOGOUT_URL,
  INFO_URL,
  REPORT_URL,
  LOGIN_API,
  update_rate,
  Title,
  SubText,
  titleSize,
  subtextSize,
  listtextSize,
  numberSize,
  Include_Comma,
  runsInWidget: config.runsInWidget,
};

// Start the script by loading the widget code
await loadWidgetCode();
