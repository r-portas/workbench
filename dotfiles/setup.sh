#!/usr/bin/env bash
# Provision a macOS machine
#
# Usage: ./dotfiles/setup.sh
set -euo pipefail

# Run from the script's own directory so paths work from any caller location
cd "$(dirname "$0")"

# Print a bold cyan heading so each step stands out from the tools' own output
section() {
  printf '\n\033[1;36m==> %s\033[0m\n' "$1"
}

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

if ! command -v bun >/dev/null 2>&1; then
  section "Installing bun"
  curl -fsSL https://bun.com/install | bash
else
  section "bun already installed"
fi

section "Linking dotfiles"

# Link each file under home/ to the same path under $HOME. Only files are
# linked, never directories, so apps can still write their own files alongside
#
# The loop reads paths from `find` (see the last line of the loop):
#   - `-print0` separates paths with NUL bytes, and `read -d ''` splits on them,
#     so filenames with spaces or newlines survive
#   - `IFS=` stops `read` trimming leading/trailing whitespace, and `-r` stops
#     it treating backslashes as escapes
#   - `< <(...)` (process substitution) feeds the loop from the main shell
#     rather than a pipe subshell, so variables set inside the loop persist
while IFS= read -r -d '' repo_file; do
  # ./home/.config/ghostty/config -> .config/ghostty/config
  rel_path="${repo_file#./home/}"
  link_path="$HOME/$rel_path"
  # Absolute path the symlink should point at (we cd'd to dotfiles/ earlier)
  link_dest="$PWD/home/$rel_path"

  # Create parent dirs as real directories, since only files get linked
  mkdir -p "$(dirname "$link_path")"

  if [ -L "$link_path" ] && [ "$(readlink "$link_path")" = "$link_dest" ]; then
    # Already points at the repo file, so re-running is a no-op
    echo "Already linked, $link_path"
  elif [ -e "$link_path" ] || [ -L "$link_path" ]; then
    # A real file or a link elsewhere (-L also catches broken links, which -e
    # misses). Never overwrite it
    echo "Skipping, $link_path already exists"
  else
    ln -s "$link_dest" "$link_path"
    echo "Linked $link_path"
  fi
done < <(find ./home -type f -print0)

section "Done"
echo "Log out and back in (or restart) for the macOS settings to take full effect."
