# my-first-video

HyperFrames + GSAP video projects.

- `test-animation/` — 6-second test title card (`index.html`), rendered to `test-animation/renders/test-animation.mp4`.
- `.claude/skills/` → `.agents/skills/` — official HyperFrames (heygen-com/hyperframes) and GSAP (greensock/gsap-skills) skills for Claude Code. Versions pinned in `skills-lock.json`.

## Render

```bash
cd test-animation
npx hyperframes check                                   # validate
npx hyperframes snapshot --at 1,3,5                     # preview still frames
npx hyperframes render -o renders/test-animation.mp4    # export MP4
```

Requires Node.js >= 22, FFmpeg and Chrome/Chromium (`npx hyperframes doctor` checks all three).
- `sleep-video/` — «Неге ұйықтай алмайсың?» (1080×1920, 32 с), cinematic illustrated style. Render: `sleep-video/renders/sleep-video.mp4`.
