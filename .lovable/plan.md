
# AI Solo Agency — Full System Build

## What We're Building

A web app that automates the entire pipeline of finding small businesses without websites, generating landing pages for them, crafting personalized outreach, and managing the deal flow — with human-in-the-loop only when needed.

The system replicates 7 "agents" as automated pipeline stages, all controlled from a single dashboard.

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────┐
│                 ORCHESTRATOR UI                  │
│  Dashboard · Pipeline · Logs · Settings · Approvals │
└──────────┬──────────────────────────┬───────────┘
           │                          │
    ┌──────▼──────┐          ┌────────▼────────┐
    │  Supabase   │          │ Server Functions │
    │  Database   │          │  (AI + APIs)     │
    └─────────────┘          └─────────────────┘
                                    │
              ┌─────────┬──────────┼──────────┬─────────┐
              │         │          │          │         │
          Firecrawl   AI Gateway  Gmail    Twilio   Calendly
          (Scout)    (Diagnoser   (Email)  (SMS)    (Booking)
                      Checker)
```

---

## Database (Supabase — 6 tables)

1. **leads** — business name, address, city, niche, google_maps_url, website_url, rating, review_count, website_age, status (new/diagnosed/built/pitched/replied/booked/closed/rejected), created_at
2. **diagnoses** — lead_id, diagnosis_text (50 words), hero_angle, tone, cold_message, channel (email/sms/ig_dm/linkedin), score (priority ranking)
3. **landing_pages** — lead_id, html_content, template_used, sections, color_scheme, screenshot_urls (JSON array), preview_url
4. **outreach** — lead_id, channel, message_content, sent_at, status (pending_review/approved/sent/replied/positive/negative), reply_text, reply_at
5. **agent_logs** — agent_name, action, details (JSON), lead_id, created_at
6. **settings** — key/value store for cities, niches, daily limits, calendly_url, approval_threshold, min_reply_rate

---

## Pages & Routes

### 1. `/` — Dashboard (home)
- Pipeline summary: leads by status (funnel chart)
- Today's stats: leads scouted, diagnosed, pages built, messages sent, replies, bookings
- Live agent log feed (latest 50 entries)
- Alert banner when human approval is needed (deal > $3K or reply rate < 12%)

### 2. `/pipeline` — Lead Pipeline
- Kanban board: New → Diagnosed → Page Built → Pitched → Replied → Booked → Closed
- Click any lead card to see full details, diagnosis, landing page preview, outreach history
- Bulk actions: approve outreach, skip lead, archive

### 3. `/leads/$leadId` — Lead Detail
- Business info, Google Maps link, current website screenshot
- Diagnosis card with hero angle, tone, cold message
- Landing page preview (iframe of generated HTML)
- Screenshots gallery
- Outreach history timeline
- Action buttons: approve message, edit message, book call, mark closed

### 4. `/builder` — Landing Page Builder
- List of leads ready for page generation
- One-click "Generate Page" button that uses AI to fill a template
- Preview generated page
- 5 pre-built templates: dental/medical, salon/beauty, trades/contractor, real estate, restaurant

### 5. `/outreach` — Outreach Queue
- Messages pending review (Checker eval results shown)
- Approve/edit/reject each message
- Sent messages with reply tracking
- Reply rate by niche and channel

### 6. `/settings` — Configuration
- Target cities (add/remove)
- Target niches (add/remove)
- Daily limits (leads to scout, pages to build, messages to send)
- Calendly URL
- Deal approval threshold (default $3,000)
- Min reply rate alert (default 12%)
- Connected channels status (Gmail, Twilio)

### 7. `/approvals` — Human-in-the-Loop
- Mobile-optimized approval page
- Pending items: high-value deals, low reply rate alerts, positive replies needing follow-up
- One-tap approve/reject with Calendly booking link insertion

---

## The 7 Agents (as Server Functions)

### Scout
- Uses Firecrawl to search Google Maps for businesses in configured cities + niches
- Filters: 5+ years on map, < 50 reviews, no website or outdated website, high rating
- Writes qualified leads to `leads` table
- Triggered manually or on a schedule via the dashboard

### Diagnoser
- Takes new leads, calls AI Gateway to generate:
  - 50-word diagnosis
  - Hero angle
  - Tone matched to industry
  - Cold message under 70 words
  - Recommended outreach channel
- Scores and ranks leads; top 5/day get flagged for Builder

### Builder
- Takes top-scored diagnosed leads
- Picks a template based on niche
- AI fills in: business name, tagline, services, color scheme, CTA copy
- Generates HTML, stores in database
- Creates screenshot via simple server-side render

### Filmer (stubbed)
- Marks landing page as "ready for video"
- In the UI, shows a checklist: "Export screenshots → Create video in Higgsfield → Upload video URL"
- Stores video URL when manually added

### Pitcher
- For email leads: sends via Gmail connector
- For SMS leads: sends via Twilio connector
- For IG DM / LinkedIn: marks as "manual send" with copy-paste message ready
- All messages go through Checker first

### Checker
- AI eval on every message before sending
- Checks for: personalization score, absence of AI markers/buzzwords, appropriate tone
- Returns pass/fail with notes
- Failed messages get flagged for human edit

### Mobile (approvals page)
- The `/approvals` route IS the mobile agent
- Optimized for phone use
- Shows positive replies with one-tap "Book Zoom" (inserts Calendly link)
- Shows deals exceeding threshold for approve/reject

---

## Connectors Needed

1. **Firecrawl** — for scouting businesses on Google Maps
2. **Gmail** — for email outreach
3. **Twilio** — for SMS outreach

These will be connected during implementation. You'll be prompted to set up each one.

---

## What's Real vs Stubbed

| Agent | Status |
|-------|--------|
| Scout (Firecrawl + Google Maps) | Real — scrapes and filters |
| Diagnoser (AI Gateway) | Real — generates diagnoses and messages |
| Builder (Templates + AI) | Real — generates HTML landing pages |
| Filmer (Higgsfield) | Stubbed — manual step with checklist |
| Pitcher (Gmail + Twilio) | Real for email/SMS, manual for IG/LinkedIn |
| Checker (AI Gateway) | Real — evals every message |
| Mobile (Approvals page) | Real — mobile-optimized approval UI |

---

## Technical Details

- **Stack**: TanStack Start, Supabase (database), Tailwind CSS
- **AI calls**: Lovable AI Gateway via server functions for diagnosis generation and message evaluation
- **Landing pages**: 5 HTML templates stored as components, AI fills content via server function, rendered HTML stored in DB
- **Outreach**: Gmail connector gateway for email, Twilio connector gateway for SMS
- **Lead scraping**: Firecrawl connector for Google Maps business data
- **No auth needed initially** — single-user system, can add later
- **Mobile-first approvals page** — designed for the phone-in-pocket workflow

This is a large build. I'll tackle it in stages: database first, then dashboard + pipeline UI, then each agent one at a time.
