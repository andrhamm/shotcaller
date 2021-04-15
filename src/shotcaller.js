import axios from "axios";
import { execSync } from "child_process";
import Twilio from "twilio";
import "./env";
import {
  logDebug,
  logError,
  logErrorAndFail,
  logInfo,
  logSuccess,
  sleepMinutes,
} from "./utils";

const [_scriptPath, _scriptName, stateInput, ...phoneNumbers] = process.argv;
if (!stateInput) {
  logErrorAndFail(`Must provide a US state abbreviation (i.e. yarn cvs VT)`);
}
let twilioClient;
let twilioFromNumber;
if (phoneNumbers.length > 0) {
  process.env.TWILIO_ACCOUNT_SID;
  process.env.TWILIO_AUTH_TOKEN;
  twilioFromNumber = process.env.TWILIO_FROM_NUMBER;

  if (
    !twilioFromNumber ||
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN
  ) {
    logErrorAndFail(
      `Must provide the following environment variables when specifying phone numbers:\nTWILIO_ACCOUNT_SID\nTWILIO_AUTH_TOKEN\nTWILIO_FROM_NUMBER`
    );
  }

  const invalidPhoneNumbers = phoneNumbers.filter(
    (num) => !num.match(/^\+[1-9]\d{1,14}$/)
  );
  if (invalidPhoneNumbers.length > 0) {
    logErrorAndFail(
      `The following provided phone numbers are invalid. Format numbers with a leading '+' and a country code, e.g., +18021234567:\n${invalidPhoneNumbers.join(
        "\n"
      )}`
    );
  }

  twilioClient = new Twilio();
}

const state = stateInput.toUpperCase();

let terminalNotifierPath;
try {
  terminalNotifierPath = execSync(`which terminal-notifier`).toString().trim();
  logDebug(`Found terminal-notifier at ${terminalNotifierPath}`);
} catch (error) {
  const errorFn = state === "TEST" ? logErrorAndFail : logError;
  errorFn(
    `Must install terminal-notifier dependency for notifications (brew install terminal-notifier)`
  );
}

const referer =
  "https://www.cvs.com/immunizations/covid-19-vaccine?icid=cvs-home-hero1-link2-coronavirus-vaccine";
const request = {
  url: `https://www.cvs.com/immunizations/covid-19-vaccine.vaccine-status.${state}.json?vaccineinfo`,
  method: "get",
  headers: {
    Accept: "*/*",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:87.0) Gecko/20100101 Firefox/87.0",
    "Accept-Language": "en-US,en;q=0.5",
    Referer: referer,
  },
  responseType: "json",
};

async function run() {
  if (state === "TEST" && terminalNotifierPath) {
    // Send a test notification
    const notifyStatus = await notify({
      escapedAvailability: "FOOBAR",
      callToActionUrl: referer,
      phoneNumbers,
      twilioFromNumber,
      twilioClient,
    });
    if (notifyStatus === 0) {
      logSuccess(`No problems detected!`);
    }
    process.exit(notifyStatus);
  }

  const response = await axios(request);

  const {
    responsePayloadData: {
      currentTime: dataUpdatedAt,
      data: { [state]: cities, ...otherData },
      ...otherResponsePayloadData
    },
    ...otherRoot
  } = response.data;

  logDebug(
    "DEBUG: " +
      JSON.stringify({
        cachedAt: dataUpdatedAt,
        ...otherData,
        ...otherResponsePayloadData,
        ...otherRoot,
      })
  );

  const dataUpdatedAtStr = new Date(dataUpdatedAt).toString();

  cities.forEach((city) => {
    const logFn = city.status === "Fully Booked" ? logDebug : logInfo;
    logFn(`${city.city}, ${city.state}: ${city.status}`);
  });

  const availabilityIn = [];

  cities.forEach((city) => {
    if (city.status !== "Fully Booked") {
      availabilityIn.push(`${city.city}, ${city.state}`);
    }
  });

  if (availabilityIn.length > 0) {
    const escapedAvailability = availabilityIn
      .map((val) => val.replace(/\W/g, ""))
      .join(", ");

    if (terminalNotifierPath) {
      await notify({
        escapedAvailability,
        callToActionUrl: referer,
        phoneNumbers,
        twilioFromNumber,
        twilioClient,
      });
    }
    logSuccess(
      `CVS has availability! In ${escapedAvailability}. Go now! ${referer}`
    );
  } else {
    logInfo(`No availability (CVS data last updated at ${dataUpdatedAtStr})`);
  }
}

async function notify({
  escapedAvailability,
  callToActionUrl,
  phoneNumbers,
  twilioFromNumber,
  twilioClient,
}) {
  let localNotifyStatus = 0;
  try {
    execSync(
      `terminal-notifier -title "CVS has availability!" -subtitle "In ${escapedAvailability}" -message "Click to open page in browser now!" -open "${callToActionUrl}" -sound "Glass" -ignoreDnD`
    );
  } catch (error) {
    localNotifyStatus = error.status;
    logError(
      `Failed to send notification (status=${error.status} ${error.message})`
    );
  }

  let twilioNotifyStatus = 0;
  if (twilioClient && phoneNumbers.length > 0) {
    logInfo(`Sending SMS notifications to ${phoneNumbers.length} numbers...`);
    for (let index = 0; index < phoneNumbers.length; index++) {
      const phoneNumber = phoneNumbers[index];
      try {
        const message = await twilioClient.messages.create({
          body: `CVS has vaccine appointment availability at locations in: ${escapedAvailability}. ${callToActionUrl}`,
          from: twilioFromNumber,
          to: phoneNumber,
        });
        logInfo(`SMS sent to ${phoneNumber} [sid=${message.sid}]`);
      } catch (error) {
        logError(`Failed to send SMS to ${phoneNumber}. ${error.message}`);
        twilioNotifyStatus = 1;
      }
    }
  }

  return localNotifyStatus === 0 && twilioNotifyStatus === 0 ? 0 : 1;
}

function poll() {
  logInfo(`Polling in 5 minute intervals...`);
  return new Promise((resolve, reject) =>
    run().then(resolve).catch(reject)
  ).finally(() => {
    // Note: please be respectful and keep a reasonable interval
    logDebug(`Sleeping 5 minutes...`);
    sleepMinutes(5).then(poll);
  });
}

poll();
