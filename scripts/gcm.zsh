# gcm — draft a git commit message from the STAGED diff via the local Ornith model, then commit.
# Inspired by Karpathy's add_to_zshrc.sh; powered by scripts/ornith.mjs (free, local, no Opus tokens).
# Setup: `source /Users/sami/work/s2d-capital/scripts/gcm.zsh` from ~/.zshrc.
# Use:   git add -p   →   gcm
gcm() {
  local ORNITH="/Users/sami/work/s2d-capital/scripts/ornith.mjs"
  local diff msg ok
  diff="$(git diff --cached 2>/dev/null)"
  if [[ -z "$diff" ]]; then
    echo "gcm: nothing staged — run 'git add' first."
    return 1
  fi
  echo "gcm: drafting with Ornith…"
  msg="$(print -r -- "$diff" | node "$ORNITH" --fast 'Write ONE Conventional Commits message (e.g. "feat: ...", "fix: ...", "refactor: ...") for this staged git diff. Imperative mood, <72 chars, no body, no quotes, no backticks. Output ONLY the single line.')"
  if [[ -z "$msg" ]]; then
    echo "gcm: no message — is Ollama running?  (brew services start ollama)"
    return 1
  fi
  printf '\n  → %s\n\n' "$msg"
  read "ok?commit with this? [y]es / [e]dit / [N]o: "
  case "$ok" in
    y|Y) git commit -m "$msg" ;;
    e|E) git commit -e -m "$msg" ;;   # opens $EDITOR pre-filled
    *)   echo "gcm: aborted (nothing committed)." ;;
  esac
}
