# shotcaller

Polls `CVS.com` for COVID-19 vaccine appointment availability, triggers macOS notification when availability is found.

## Installation and Usage

Pass a state abbreviation to the commands (examples show `vt`).

Optionally install `terminal-notifier` for system notifications.

    brew install terminal-notifier

With NPM:

    npm install -g shotcaller
    shotcaller vt

With Yarn:

    yarn global add shotcaller
    shotcaller vt

Or, from source:

    git clone git@github.com:andrhamm/shotcaller.git
    cd shotcaller
    yarn build
    yarn cvs vt
    // or
    ./bin/shotcaller vt

---

## TODO

- Add support for Walgreens and other providers
- Figure out why `node-notifier` package doesn't work (plist error)
