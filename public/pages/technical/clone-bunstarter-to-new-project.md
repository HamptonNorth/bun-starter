---
title: Clone bunstarter to a new project
summary: Notes to clone bunstarter from GitHub to a local development set up.
created: 2026-01-05
published: y
file-type: markdown
style: github
private: rcollins@redmug.co.uk
sticky: true
---
# Clone the repro
Change directory to your `~/code` directory.

From GitHub get the URL from bunstarter repro `https://github.com/HamptonNorth/bun-starter.git` 

On the dev workstation in `~/code` 

```bash
git clone https://github.com/HamptonNorth/bun-starter.git my-new-project-directory-name
```
Then
```bash
cd my-new-project-directory-name
# to install dependancies
npm install
```

Copy .env.example to .env and set variables

```bash
cp .env.example .env
# Then edit .env with your credentials
# 
# note you cannot use the 'social' credentials once deployed - they will differ
```

Here is the example .env

```bash
# .env
PORT=3000

# Default admin user created on running
ADMIN_NAME=
ADMIN_EMAIL=
# ADMIN_PASSWORD must be at least 8 characters, contain at least 1 uppercase letter and at least 1 number
ADMIN_PASSWORD=
BETTER_AUTH_SECRET=
# URL of home page e.g. https://bunstarter.redmug.dev/
BETTER_AUTH_URL=

TEMP_PASSWORD_LAPSE_HOURS=48

# database name including extension
DATABASE_NAME=

# version 0.0.0
VERSION=0.8.9

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# On Github easier to have multiple CLIENT_ID and CLIENT_SECRET
# for dev http://localhost:3000/
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# for production https://bunstarter.redmug.dev/
#GITHUB_CLIENT_ID=
#GITHUB_CLIENT_SECRET=



# Pages - Multiple categories with different styles
PAGE_CONFIG='{"start":"github","technical":"github:sidebar","rants":"mcss-georgia","docs":"mcss-verdana"}'

```


Then run `bun run dev' - this will thro the error and prompt you to run the set up script.
