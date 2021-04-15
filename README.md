# shotcaller

Polls `CVS.com` for COVID-19 vaccine appointment availability, triggers OS notifications and/or SMS notifications when availability is found.

## Installation and Usage

Pass a state abbreviation to the commands (examples show `vt`).

With NPM:

    npm install -g shotcaller
    shotcaller vt

With Yarn:

    yarn global add shotcaller
    shotcaller vt

Or, from source:

    git clone git@github.com:andrhamm/shotcaller.git
    cd shotcaller
    yarn install
    yarn build
    yarn shotcaller vt

## Notifications (optional)

### System Notifications

Optionally install `terminal-notifier` for system notifications. These instructions only cover macOS usage but other platforms are supported, check out the [docs](https://github.com/julienXX/terminal-notifier).

    brew install terminal-notifier

Tip: On macOS, go into `System Preferences -> Notifications`, find the `terminal-notifier` app in the left scroll view, and set the alert style to `Alerts`. This will make notifications sticky until dismissed so you don't miss them.

Once you have the dependencies set up, test the notifications by passing `test` in place of the state abbreviation:

    shotcaller test
    # or, when running from source
    yarn notify

### SMS Notifications via Twilio

Sign up for a [free trial Twilio account](www.twilio.com/referral/G6iTGO) (<- referral link) to enable SMS notifications (text messages) to your phone.

If you are using a trial Twilio account, make sure you've verified the phone numbers you plan to send text messages to. You can do that [here](https://www.twilio.com/console/phone-numbers/verified).

Once your account is setup, you must set the following required environment variables.

When running shotcaller from source, simply add a `.env` file in the root of the cloned repository like so (example values):

    # fake example values, get these from your Twilio account
    TWILIO_FROM_NUMBER=+18021234567
    TWILIO_ACCOUNT_SID=AC14758f1afd44c09b7992073ccf00b43d
    TWILIO_AUTH_TOKEN=282b45b05d0eb361485b65ec88304ba5

When running the `shotcaller` command, simply export the variables to your environment by running the following lines in your terminal or adding them to your `~/.zshrc` file:

    # fake example values, get these from your Twilio account
    export TWILIO_FROM_NUMBER=+18021234567
    export TWILIO_ACCOUNT_SID=AC14758f1afd44c09b7992073ccf00b43d
    export TWILIO_AUTH_TOKEN=282b45b05d0eb361485b65ec88304ba5

To enable SMS notifications, first try a test run by passing in your phone number in the following format (substitute your own number):

    shotcaller test +18027654321
    # or
    yarn notify +18027654321

When you've sent a successful test, pass one or more phone numbers after the state abbreviation for the real deal:

    shotcaller vt +18027654321 +18027654322 +18027654323
    # or
    yarn shotcaller vt +18027654321 +18027654322 +18027654323

---

## TODO

- Add support for Walgreens and other providers
- Figure out why `node-notifier` package doesn't work (plist error)
- Improve how the npm module is packaged/published?
- Add tests (lol)
