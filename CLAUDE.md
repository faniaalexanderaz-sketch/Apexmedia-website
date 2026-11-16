# Apex Media

## Instagram skills (`/ig-*`)

The voice profile lives in the repo at `.claude/instagram/voice.md`. The skills
look for it at `~/.claude/instagram/voice.md`, which does not survive between
cloud sessions. Before running any `/ig-*` skill:

```bash
mkdir -p ~/.claude/instagram && cp -n .claude/instagram/*.md ~/.claude/instagram/
```

After a skill writes or updates `voice.md`, `swipe.md` or `log.md` in
`~/.claude/instagram/`, copy the file back into `.claude/instagram/` and commit
it.

`hookscore.py` is tuned on English: for Italian hooks use it only to discard
obviously weak options, not to pick the winner.
