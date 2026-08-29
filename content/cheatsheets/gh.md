# `gh` CLI

Cheatsheet for the GitHub CLI.

## Repos

```sh
# Clone into a specific path
gh repo clone owner/name ~/path
```

```sh
# Create a repo from the current directory and push
gh repo create owner/name --private --source=. --push
```

```sh
# Open the repo in the browser
gh repo view --web
```

```sh
# Checkout a PR locally
gh pr checkout 123
```

## References

- [GitHub CLI manual](https://cli.github.com/manual/) — official command reference
