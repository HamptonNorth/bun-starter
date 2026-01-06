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


Then run `bun run dev' - this will throw the error and prompt you to run the set up script. Run that and you should be good to go.

## Resetting local Git to GitHub links
By cloning an existing repository, your local development folder is currently "linked" to the original source (the origin remote). To push this as a completely new project, you need to redirect those links to a new GitHub repository.

Here is the workflow to get this done within Zed and your terminal.

##### Create a New Repository on GitHub
Before running commands, go to GitHub and create a new repository.

Do not initialize it with a README, license, or .gitignore, as your local project already has these files.

Copy the HTTPS or SSH URL (e.g., https://github.com/HamptonNorth/pages.git).

##### Update Remotes using Zed terminal


**Step A:** Check existing remotes
Run this to see the current link to the old project:

```Bash

git remote -v

```

**Step B:** Remove the old link
You want to sever the connection to the original repository so you don't accidentally push changes there.

```Bash

git remote remove origin

```

**Step C:** Add your new repository
Now, link your local folder to the new GitHub URL you copied earlier:

```Bash

git remote add origin https://github.com/your-username/new-project.git

```

##### Commit and Push
Now that the "plumbing" is redirected, you can send your code to GitHub.

Stage and Commit: If you haven't committed your "numerous changes" yet, you can use the Source Control panel in Zed (the icon that looks like a branch) or use the terminal:

```Bash

git add .
git commit -m "Initial commit for new project"

```

**Push to GitHub:** Since this is the first push to a new remote, you need to set the "upstream" branch:

```Bash

git push -u origin main
#(Note: If your default branch is named master instead of main, use git push -u origin master.)

```
