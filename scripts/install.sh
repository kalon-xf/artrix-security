#!/usr/bin/env bash
set -Eeuo pipefail

readonly ARTRIX_REPOSITORY_URL="${ARTRIX_REPOSITORY_URL:-https://github.com/kalon-xf/artrix-security.git}"
readonly ARTRIX_BRANCH="${ARTRIX_BRANCH:-codex/artrix-build}"
readonly ARTRIX_DATA_ROOT="${XDG_DATA_HOME:-${HOME:?HOME is required}/.local/share}"
readonly ARTRIX_INSTALL_DIR="${ARTRIX_INSTALL_DIR:-${ARTRIX_DATA_ROOT}/artrix-security}"
readonly ARTRIX_BIN_DIR="${ARTRIX_BIN_DIR:-${HOME:?HOME is required}/.local/bin}"

info() { printf '\033[1;36m[artrix]\033[0m %s\n' "$*"; }
success() { printf '\033[1;32m[artrix]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[artrix]\033[0m %s\n' "$*" >&2; exit 1; }

on_error() {
  fail "Installation stopped at line $1. Existing configuration was preserved."
}
trap 'on_error "$LINENO"' ERR

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is required. Install it, then run this command again."
}

check_node_version() {
  node -e '
    const [major, minor] = process.versions.node.split(".").map(Number);
    if (major < 20 || (major === 20 && minor < 11)) process.exit(1);
  ' || fail "Node.js 20.11 or newer is required. Found $(node --version)."
}

install_source() {
  if [[ ! -e "$ARTRIX_INSTALL_DIR" ]]; then
    info "Cloning Artrix into $ARTRIX_INSTALL_DIR"
    mkdir -p "$(dirname "$ARTRIX_INSTALL_DIR")"
    git clone --branch "$ARTRIX_BRANCH" --single-branch "$ARTRIX_REPOSITORY_URL" "$ARTRIX_INSTALL_DIR"
    return
  fi

  [[ -d "$ARTRIX_INSTALL_DIR/.git" ]] || fail "$ARTRIX_INSTALL_DIR exists but is not an Artrix Git checkout. Set ARTRIX_INSTALL_DIR to another path."
  [[ -z "$(git -C "$ARTRIX_INSTALL_DIR" status --porcelain)" ]] || fail "The existing Artrix checkout has uncommitted changes. Commit or move them before updating."

  local configured_remote current_branch
  configured_remote="$(git -C "$ARTRIX_INSTALL_DIR" remote get-url origin)"
  [[ "$configured_remote" == "$ARTRIX_REPOSITORY_URL" ]] || fail "The existing checkout uses a different origin: $configured_remote"
  current_branch="$(git -C "$ARTRIX_INSTALL_DIR" branch --show-current)"
  [[ "$current_branch" == "$ARTRIX_BRANCH" ]] || fail "The existing checkout is on $current_branch; switch it to $ARTRIX_BRANCH before updating."

  info "Updating the existing Artrix checkout"
  git -C "$ARTRIX_INSTALL_DIR" fetch --prune origin "$ARTRIX_BRANCH"
  git -C "$ARTRIX_INSTALL_DIR" merge --ff-only "origin/$ARTRIX_BRANCH"
}

install_launcher() {
  local launcher_target="$ARTRIX_BIN_DIR/artrix"
  mkdir -p "$ARTRIX_BIN_DIR"

  if [[ -L "$launcher_target" && "$(readlink "$launcher_target")" == "$ARTRIX_INSTALL_DIR/scripts/artrix" ]]; then
    return
  fi
  if [[ -e "$launcher_target" || -L "$launcher_target" ]]; then
    info "Kept the existing $launcher_target; use $ARTRIX_INSTALL_DIR/scripts/artrix directly."
    return
  fi
  ln -s "$ARTRIX_INSTALL_DIR/scripts/artrix" "$launcher_target"
}

main() {
  require_command git
  require_command node
  require_command npm
  check_node_version
  install_source

  cd "$ARTRIX_INSTALL_DIR"
  if [[ ! -f .env.local ]]; then
    cp .env.example .env.local
    info "Created .env.local from the safe local-demo template"
  else
    info "Preserved the existing .env.local configuration"
  fi

  info "Installing pinned dependencies"
  npm ci --ignore-scripts
  info "Building the application"
  npm run build
  install_launcher

  success "Installation complete"
  printf '\nStart Artrix with:\n  %s start\n\nThen open:\n  http://127.0.0.1:3000\n' "$ARTRIX_BIN_DIR/artrix"
  if [[ ":$PATH:" != *":$ARTRIX_BIN_DIR:"* ]]; then
    printf '\nOptional: add this directory to PATH:\n  export PATH="%s:$PATH"\n' "$ARTRIX_BIN_DIR"
  fi
}

main "$@"
