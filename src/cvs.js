import axios from "axios";
import { execSync } from "child_process";
import {
  logDebug,
  logErrorAndFail,
  logInfo,
  logSuccess,
  sleepMinutes,
} from "./utils";

async function run() {
  const { [2]: stateInput } = process.argv;
  if (!stateInput) {
    logErrorAndFail(`Must provide a US state abbreviation (i.e. yarn cvs VT)`);
  }
  const state = stateInput.toUpperCase();
  const referer =
    "https://www.cvs.com/immunizations/covid-19-vaccine?icid=cvs-home-hero1-link2-coronavirus-vaccine";
  const request = {
    url: `https://www.cvs.com/immunizations/covid-19-vaccine.vaccine-status.${state}.json?vaccineinfo`,
    method: "get",
    headers: {
      Accept: "application/json",
      Referer: referer,
    },
    responseType: "json",
  };
  const response = await axios(request);

  logDebug(JSON.stringify(response.data));

  const {
    currentTime: dataUpdatedAt,
    data: { [state]: cities },
  } = response.data.responsePayloadData;

  const dataUpdatedAtStr = new Date(dataUpdatedAt).toString();

  logDebug(JSON.stringify(cities));

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

    execSync(
      `terminal-notifier -title "CVS has availability!" -subtitle "In ${escapedAvailability}" -message "Click to open page in browser now!" -open "${referer}" -timeout "10" -json "true"`
    );
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
    logDebug(`sleeping 5 minutes...`);
    sleepMinutes(5).then(poll);
  });
}

poll();
