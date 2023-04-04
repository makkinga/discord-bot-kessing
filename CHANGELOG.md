# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.3.6] 31-03-2023

### Added

- MetaMask deeplink for mobile users (32bcc069)
- Added options object to `React.error()` for better error logging in the future (aeb7de06)
- Added `/account-address` command to retrieve the address linked to your Discord account (bb96ccb0) (3.2.0)
- Added `/enable-dms` command so people can opt-in to be notified when they catch rain/snow (19500b0b) (3.3.0)
- Added support for the updated account dashboard (78e68986, 67d7bcbe)
- Arguably the best april fools prank ever (364f7da8)

### Fixed

- Fixed the issue where multiple usernames containing `||` would be parsed as spoiler by Discord (a63c6de5)
- Fixed a bug that broke the verification process (7a61133d)
- Gift embeds would change to "@someUser has tipped X to @otherUser" this is now removed (2a5a4df6)
- Hopefully fixed the duplicate nonce issue (a1db3210)

### Changed

- Disabled the `/balance` command for non account holders (d1af46e9)
- To avoid confusion the `/create-account` won't work for account holders anymore (972a03de)

### Removed

- Arguably the worst april fools prank ever (364f7da8)

## [3.1.9] 10-03-2023

### Added

- Added the `/display-name` command. By default, all usernames that caught either rain or snow will be shown in the success message. By disabling this setting in the `/display-name` command you can hide your username.
- Added transaction duration to logs (5a86421)

### Fixed

- Removed duplicate rain recipe (261d360)
- Fixed account check that would always return true (261d360)
- Fixed Docker build issues (79637a4, 5a86421, abd10ba, 3ba3ba1)
- Enabled previously commented `express.json()` (5a86421)
- Updated readme to show shields for the correct repo (1d0cbf2)
- Disabled Sequelize alter to prevent errors in Docker build (4d74e6b)
- Reordered `transaction.js` imports that were causing errors (52e13b8)
- Disabled git version in `/about` as a temporary fix for the errors it was throwing (4173487)

### Changed

- Moved command registration back to its own file (5c8ab31)

## [3.0.0] 02-03-2023

### Added

- Bank contract. Kessing no longer keeps any wallet data and tokens can be deposited using MetaMask
- A new way to create and manage your account was added in the form of a web page
- The code was updated to DiscordJS v14 and the Discord API v10
- The information in `/help` has moved to GitBook
- CRYSTAL was added as a tippable token
- The long awaited and most requested `/snow` command has arrived!
- A new `/statistics` command had been added inlcuding charts for individual tokens
- The "Kessing's Mancave" Discord server is now accessable to the public. This is the new place for support, bug reporting, and feature requests

### Removed

- The `/get-gas` command was removed, gas will now be provided by DFK
- `/convert`-address was removed for obvious reasons
- All "send" commands have been removed. Tokens can now be withdrawn from the contract from the account website
- The `/pkey` command was removed, Kessing has no clue what your pkey is
- Tip`/burn` statistics have been removed