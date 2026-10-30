#!/usr/bin/env bash
# Provision a macOS machine
#
# Usage: ./dotfiles/setup.sh
set -euo pipefail

# Everything below (defaults, Homebrew paths, Brewfile casks) is macOS-only
if [ "$(uname -s)" != "Darwin" ]; then
  echo "This script only supports macOS" >&2
  exit 1
fi

# Run from the script's own directory so paths work from any caller location
cd "$(dirname "$0")"

# ---- Helpers ----

# Print a bold cyan heading so each step stands out from the tools' own output
section() {
  printf '\n\033[1;36m==> %s\033[0m\n' "$1"
}

# ---- macOS settings ----

section "Configuring macOS settings"

# Typing: disable auto-correct, smart quotes/dashes and the accent popup so
# holding a key repeats it
defaults write NSGlobalDomain NSAutomaticSpellingCorrectionEnabled -bool false
defaults write NSGlobalDomain NSAutomaticQuoteSubstitutionEnabled -bool false
defaults write NSGlobalDomain NSAutomaticDashSubstitutionEnabled -bool false
defaults write NSGlobalDomain ApplePressAndHoldEnabled -bool false

# Key repeat: fastest the System Settings sliders allow (units of 15 ms)
defaults write NSGlobalDomain InitialKeyRepeat -int 15
defaults write NSGlobalDomain KeyRepeat -int 2

# Trackpad: tap to click (the -currentHost key also covers the login screen)
defaults write com.apple.AppleMultitouchTrackpad Clicking -bool true
defaults -currentHost write NSGlobalDomain com.apple.mouse.tapBehavior -int 1

# ---- Homebrew ----

if ! command -v brew >/dev/null 2>&1; then
  section "Installing Homebrew"
  # Same command from https://brew.sh
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # Make brew available in this shell
  # This only works on Apple Silicon
  eval "$(/opt/homebrew/bin/brew shellenv)"
else
  section "Homebrew already installed"
fi

section "Installing Brewfile"
brew bundle --file Brewfile

# ---- bun ----

if ! command -v bun >/dev/null 2>&1; then
  section "Installing bun"
  curl -fsSL https://bun.com/install | bash
else
  section "bun already installed"
fi

# ---- Dotfiles ----

section "Linking dotfiles"

# Link a file under home/ (e.g. .config/ghostty/config) to the same path under
# $HOME. Only files are linked, never directories, so apps can still write their
# own files alongside. Existing files are never overwritten
link() {
  local rel="$1"
  local src="$PWD/home/$rel" dest="$HOME/$rel"
  mkdir -p "$(dirname "$dest")"

  if [ "$(readlink "$dest")" = "$src" ]; then
    echo "Already linked, $dest"
  elif [ -e "$dest" ] || [ -L "$dest" ]; then
    # -L also catches broken links, which -e misses
    echo "Skipping, $dest already exists"
  else
    ln -s "$src" "$dest"
    echo "Linked $dest"
  fi
}

find home -type f | while IFS= read -r file; do link "${file#home/}"; done

# ---- Done ----

section "Done"
echo "Log out and back in (or restart) for the macOS settings to take full effect."

