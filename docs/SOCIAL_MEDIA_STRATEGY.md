# Lading - Short-Video Social Media Strategy

A short-video-first plan to showcase Lading and attract importers, exporters, and clearing agents. Built on the Scroll Stoppers hook system and the INTERRUPT pattern-interrupt method.

## 1. Objective

Turn short vertical videos into a top-of-funnel engine: stop the scroll, teach one useful thing about trade documentation, and drive viewers to the free tool. Success is measured in saves, shares, and signups, not vanity views.

## 2. Audience

- SME importers and exporters in Nigeria (and the wider African trade corridor).
- Clearing agents and freight forwarders who want fewer rejects and faster clearance.
- New traders who do not yet know what a Form M or a PAAR is.

Speak to one person. The viewer is a busy trader on a phone, sound often off, scrolling fast.

## 3. Content pillars

| Pillar | Purpose | Example topics |
|---|---|---|
| Documents | Teach the core document set | Form M, PAAR, SONCAP, NAFDAC, certificate of origin |
| Mistakes that cost money | Loss aversion, high shareability | Wrong HS code, FOB by air, document mismatch, demurrage |
| Trade terms and duty | Authority and clarity | Incoterms, landed cost, FX and duty, rules of origin |
| Compliance and risk | Trust and safety | Screening, restricted parties, audit trail, share links |
| Product proof | Show the tool working | AI HS assistant, consistency check, requirement checker |

Rotate the pillars so the feed never feels like an ad.

## 4. The hook system

Every video opens with a hook from the Scroll Stoppers set, and the first visual uses an INTERRUPT category. Mix them so the feed does not repeat the same opener.

### The 10 hooks (Scroll Stoppers)

| Hook | One line |
|---|---|
| Delayed Reveal | Open on an intense reaction, hold, then reveal the cause |
| Curiosity Gap Question | Ask a short question, answer it visually |
| Mess Up | A confident setup that fails |
| Danger | A real or implied threat |
| Urgency | "Before you do X again" |
| Direct Callout | Speak as if to one person |
| Open Loop | An unexpected result you are about to reveal |
| Transition | A hard cut between contrasting scenes |
| Fake Notification | Mimic a real notification popping up |
| Interactive | Ask for a specific comment word |

### The 12 pattern interrupts (INTERRUPT)

Gravity and physics breaks, scale and proportion, time manipulation, glitch and corruption, material and texture swaps, mirror and symmetry, impossible objects, body and anatomy, camera and perspective, emotion and expectation, light and color, typography and text.

Three questions before every video:
1. What should the viewer feel? (awe, unease, urgency)
2. Does it need to work on mute? (if yes, lead with typography)
3. Am I selling, teaching, or telling a story?

### AI prompt rules (from the guides)

- State motion as physics, not vibes ("the water flows upward", not "surreal water").
- Lock the camera ("locked camera, no zoom, pan, tilt, or rotation").
- Keep lighting consistent between the subject and the scene.
- Render vertical 9:16.

## 5. Video format template

Use this for every post.

```
Scene N [hook or role]:
  Frame range: {visual description. On-screen text.}
  Hook overlay: "..."
  Narrator: '...'
  Visual: {shot list}
```

Structure:
- Scene 1 (0-1.5s): hook. One interrupt, one overlay, one spoken line.
- Scenes 2-4: the payoff. One idea per scene, 2-4s each.
- Final scene: the turn. A soft CTA plus the handle ("follow Lading").

Keep total length 15-40 seconds. One idea per video.

## 6. Production workflow

- Write the post from the 30-post library (see `docs/SOCIAL_CONTENT_30_POSTS.md`).
- Generate or film the visual using the scene prompts (AI video tools: Veo, Kling, Runway, Sora, Seedance, Pika, Luma, Hailuo; or screen-record the Lading UI for product proof).
- Add captions burned in (most viewers watch on mute). Use the brand palette (Deep Harbor, Signal Teal).
- Voiceover: calm, precise, one sentence per scene.
- Export 9:16, 1080x1920, captions on.

Screen recordings of the product are the highest-converting asset. Record: the HS assistant returning codes, the consistency check flagging a mismatch, the requirement checker returning Form M and PAAR, the share link.

## 7. Cadence and calendar

- 5 posts per week (Mon-Fri), one pillar per day theme:
  - Mon: Documents
  - Tue: Mistakes that cost money
  - Wed: Trade terms and duty
  - Thu: Compliance and risk
  - Fri: Product proof
- Batch-produce weekly. One filming or generation session, five videos.
- Repost the best two per month.

## 8. Platform playbook

Post natively to each platform (do not just cross-post links).

| Platform | Format | Length | Notes |
|---|---|---|---|
| TikTok | Vertical video | 15-40s | Best cold reach. Lead with the strongest hook. |
| Instagram Reels | Vertical video | 15-40s | Strong saves. Add a carousel version monthly. |
| YouTube Shorts | Vertical video | 15-40s | Also upload a long-form cut monthly for search. |
| Facebook Reels | Vertical video | 15-40s | Strong with the 30+ business audience and groups. |
| Threads | Vertical video + text | 15-40s | Conversational; reply to comments with extra tips. |
| Bluesky | Vertical video + text | 15-40s | Early-mover advantage; link-friendly. |

Every video also becomes a blog post at `/blog` with links to each platform.

## 9. Caption, hashtag, and CTA rules

- Caption: repeat the hook, then one line of value, then the CTA. Keep it under 300 characters.
- Hashtags: 3-6, mix broad and niche. Base set: #Nigeria #Import #Export #Trade #Customs. Add topic tags (#Incoterms #HScodes #FormM #PAAR #Demurrage #AfCFTA).
- CTA ladder: soft ("save this"), medium ("follow for part 2"), hard ("try it free, link in bio").
- Never lead with the product. Lead with the problem; the tool is the payoff.

## 10. Metrics and KPIs

| Metric | Target signal |
|---|---|
| 3-second view rate | Above 60% (hook is working) |
| Average watch time | Above 50% of length |
| Saves and shares | The real distribution signal |
| Profile taps and follows | Audience building |
| Link clicks and signups | Conversion |

Kill hooks that underperform after 3 tries; double down on the top 3 openers.

## 11. Do's and don'ts

Do:
- Lead with the problem and the cost of getting it wrong.
- Use real numbers (duty percentages, demurrage per day, dwell time).
- Show the product on screen for product-proof posts.
- Burn in captions and design for mute.
- Reply to every comment with a useful tip.

Don't:
- Do not use fear that is not true.
- Do not make claims about a specific shipment's outcome.
- Do not promise customs outcomes. Always add the guidance-only disclaimer in the caption or pinned comment.
- Do not post the same hook twice in a week.

## 12. Compliance note

Every post that touches classification, duty, or compliance must carry the standard guidance-only disclaimer (see `docs/../src/components/disclaimer.tsx` text) in the caption or as a pinned comment. This mirrors the disclaimers shown across the app.
