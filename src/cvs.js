import axios from "axios";
import { execSync } from "child_process";
import {
  logDebug,
  logErrorAndFail,
  logInfo,
  logSuccess,
  sleepMinutes,
} from "./utils";

let terminalNotifierPath;
try {
  terminalNotifierPath = execSync(`which terminal-notifier`).toString().trim();
  logDebug(`Found terminal-notifier at ${terminalNotifierPath}`);
} catch (error) {
  logError(
    `Must install terminal-notifier dependency for notifications (brew install terminal-notifier)`
  );
}

const { [2]: stateInput } = process.argv;
if (!stateInput) {
  logErrorAndFail(`Must provide a US state abbreviation (i.e. yarn cvs VT)`);
}
const state = stateInput.toUpperCase();

async function run() {
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

  cities.forEach(({ city, status }) => {
    if (status !== "Fully Booked") {
      availabilityIn.push(city);
    }
  });

  if (availabilityIn.length > 0) {
    const escapedAvailability = availabilityIn
      .map((val) => val.replace(/\W/g, ""))
      .join(", ");

    if (terminalNotifierPath) {
      execSync(
        `terminal-notifier -title "CVS has availability!" -subtitle "In ${escapedAvailability}" -message "Click to open page in browser now!" -open "${referer}" -timeout "10" -json "true"`
      );
    }
    logSuccess(
      `CVS has availability! In ${escapedAvailability}. Go now! ${referer}`
    );
  } else {
    logInfo(`No availability as of ${dataUpdatedAtStr}`);
  }
}

function poll() {
  logInfo(`Polling in 5 minute intervals...`);
  return new Promise((resolve, reject) =>
    run().then(resolve).catch(reject)
  ).finally(() => {
    logDebug(`Sleeping 5 minutes...`);
    sleepMinutes(5).then(poll);
  });
}

poll();
