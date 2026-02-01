import email from "./email.handler.js";
import webhook from "./webhook.handler.js";
import schedule from "./schedule.handler.js";
import condition from "./condition.handler.js";
// import delay from "./delay.handler.js";
import googleSheets from "./googleSheets.handler.js";
// import googleDrive from "./googleDrive.handler.js";

export default {
  email,
  webhook,
  schedule,
  condition,
  //   delay,
  google_sheets: googleSheets,
  //   google_drive: googleDrive
};
