**Don't use GHDesktop!**

# Updating from `restructure-everything-tryout`

## Chcking the changes:

```sh
git fetch upstream
git log main..upstream/restructure-everything-tryout
git merge upstream/restructure-everything-tryout
git push origin main
```

(Directly merging:)

```sh
git pull upstream
git push origin main
```

# Committing: normal via GHDesktop

Or: `git commit -m "Message"`

# Pushing to remote

`git push origin main`

# Debugging

## Check remote upstream:

`git remote -v`

# Setting up a new dependent repo

## Adding an upstream:

```sh
git remote add upstream https://github.com/original-owner/repoA.git
git fetch upstream BRANCHNAME
git branch --set-upstream-to=upstream/BRANCHNAME main
```

## Setting repo's histroy to branch history (on repo setup!):

```sh
git fetch upstream
git checkout main
git reset --hard upstream/main
git push origin main --force   # WARNING: overwrites B's main
```

---

[More info](https://chatgpt.com/share/e/68e10138-0dd0-8000-a340-30a813b467d7)
