![Logo DFK](https://storageapi.fleek.co/ed2319ff-1320-4572-a9c4-278c4d80b634-bucket/logo_dfk_full.png)

# Barkeep Kessing

#### DeFi Kingdoms Discord Tipbot

![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/makkinga/discord-bot-kessing?label=version&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/makkinga/discord-bot-kessing?style=flat-square)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/makkinga/discord-bot-kessing?style=flat-square)

Barkeep Kessing was built with :heart: by @Gyd0x for the DeFi Kingdoms Discord community.

Please feel free to send me feature requests, bug reports, or other questions and suggestions!

## Enjoy Barkeep Kessing?

Consider buying me a coffee

```
0xb2689E31b229139B52006b6Ec22C991A66c9D257
```

## Bugs reporting / feature requests / support

To report bugs, request a feature, or support, please join our [Discord server](https://discord.gg/m3QjcuCwDQ) and head over to the `#bug-reporting`, `#feature-requests` or `#support` channel to create a ticket

## Installation

Before you start, make sure you have the following installed:

- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

Clone the repository

```bash
git clone git@github.com:makkinga/discord-bot-kessing.git
```

Navigate to the directory

```bash
cd discord-bot-kessing
```

[Configure](#configuration) the environment variables

Build the Docker image and start the container

```bash
docker compose up -d
```

Starting the container will automatically start the bot using PM2

## Configuration

Copy the `.env.example` file to `.env`

```bash
cp .env.example .env
```

Edit the `.env` file and fill in the required environment variables

## Development

To log in to the container use the following command

```bash
docker exec -it kessing /bin/bash
```

To run commands inside the container without logging in, use the following command

```bash
docker exec -it kessing-bot-1 <command> 
```

## Testing

To add the bot to a testing server you can use the following link

```
https://discord.com/api/oauth2/authorize?client_id=[CLIENT_ID]&permissions=534523149376&scope=bot%20applications.commands
```

## Contributing

To contribute to this project, please create a new branch with the following naming convention:

| Branch type | Branch name                      |
|-------------|:---------------------------------|
| Feature     | `feature/<feature-name>`         |
| Bugfix      | `bugfix/<bug-name>`              |
| Hotfix      | `hotfix/<hotfix-name>`           |
| Chore       | `chore/<chore-name>`             |
| Refactor    | `refactor/<refactor-name>`       |
| Performance | `performance/<performance-name>` |
| Security    | `security/<security-name>`       |
| Tooling     | `tooling/<tooling-name>`         |
| CI          | `ci/<ci-name>`                   |
| Other       | `other/<other-name>`             |

When you are ready to submit a pull request, please make sure to merge the latest from the `upstream` repository and resolve any conflicts before submitting the pull request.

> For "small" changes, prefix the repo URL with `vscode.dev/`

## Code style

The code style is enforced using ESLint, Yamllint, and Prettier. Please make sure to run the linter before submitting a pull request.
