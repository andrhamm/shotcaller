# shotcaller

Polls `CVS.com` for Covid-19 vaccine appointment availability, triggers macOS notification when availability is found.

## Installation

    brew install terminal-notifier
    yarn build

## Usage

Pass a US state abbreviation to the `cvs` script:

    yarn cvs VT

---

## TODO

- Add support for Walgreens and other providers
- Figure out why `node-notifier` package doesn't work (plist error)
