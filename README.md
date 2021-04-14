# shotcaller

Polls `CVS.com` for COVID-19 vaccine appointment availability, triggers macOS notification when availability is found.

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
    # or
    ./bin/shotcaller vt

## Notifications (optional)

Optionally install `terminal-notifier` for system notifications.

    brew install terminal-notifier

Tip: On macOS, go into `System Preferences -> Notifications`, find the `terminal-notifier` app in the left scroll view, and set the alert style to `Alerts`. This will make notifications sticky until dismissed so you don't miss them.

Once you have the dependencies set up, test the notifications by passing `test` in place of the state abbreviation:

    shotcaller test
    # or
    yarn notify

---

## TODO

- SMS/email notification, or other AFK alert medium
- Add support for Walgreens and other providers
- Figure out why `node-notifier` package doesn't work (plist error)
- Improve how the npm module is packaged/published?
