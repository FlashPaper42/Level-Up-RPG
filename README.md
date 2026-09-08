# Level Up RPG

Level Up RPG is a Minecraft-themed educational adventure game for children ages
4–10. Players practice reading, math, spelling, memory, patterns, and real-life
cleaning challenges while battling mobs and earning progression rewards.

## Play online

The production game is hosted at <https://mathminecraft.netlify.app/>.
Open it in a current desktop or mobile browser. Progress, profiles, cosmetics,
and settings are currently stored locally in the browser on that device. Clearing
site data or using a different browser can remove or hide local progress.
The game validates saved profile records before loading them and reports storage
quota/private-browsing failures in the UI; it does not sync data to a server.

Reading challenges use the browser Web Speech API when supported and permitted.
Typing remains available when speech recognition is unavailable or microphone
access is denied. Microphone audio is controlled by the browser; the game does
not require an installed executable.

Audio playback follows browser autoplay policy. Enable sound with a user
interaction; unsupported or blocked formats fail silently without preventing
the game from running. Speech recognition is an optional browser capability,
so typing remains the fallback.

## Skills

| Skill | Challenge |
| --- | --- |
| Reading | Speak or type words aloud |
| Math | Solve math problems |
| Writing | Spell Minecraft item and creature names |
| Memory | Match pairs of cards |
| Patterns | Repeat color sequences |
| Cleaning | Complete a real-world chore |

## Development

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

Preview the production build locally with:

```bash
npm run preview
```

The React source is in `src/`, static media is in `public/assets/`, and Vite
produces the deployable site in `dist/`. Netlify should publish `dist/` and
serve the SPA entry point for client-side navigation.
Deployment metadata in `netlify.toml` and `public/_headers` enables SPA
fallbacks, MIME sniffing protection, referrer restrictions, and a microphone-
only permissions policy.

## Privacy and safety

This is an educational game for children. Parent controls and profile PINs are
local convenience features, not account authentication. Do not use them as a
substitute for a real parent account or sensitive-data protection. Review
browser microphone permissions before using Reading speech input.

## Content and assets

Before distributing a public hosted build, verify that all Minecraft-derived
images, sounds, fonts, textures, and third-party URLs are permitted for the
intended educational use.
