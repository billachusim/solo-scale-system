# Solo Scale System

This Chinese guy created agents in Claude Code for landing pages and single-handedly serves 47 small businesses a month, taking $400 from each.

He built a system of 7 agents on Claude Sonnet 4.6 that analyzes Google Maps in small towns, finds small businesses without websites there, and over 1 weekend takes each one to a finished mockup with video and cold message.

No assistant, no sales team, no SDR. Just him, a MacBook, an iPhone, and 1 API key.

And traditional web design agencies keep teams of 8 people on salary for the same order flow, while his expenses are only tokens and subscriptions to Lovable, Higgsfield, and Calendly.

7 agents work through 1 orchestrator on Claude Code Router. Usage is about 3 million tokens a day, the average API bill is about $480 a month.

All 7 go through MCP servers and write shared state to the file system, without shared state in memory and without race conditions, and 1 of them lives right in the iPhone and picks up positive replies from the subway, a taxi, or on walks.

And here is the system prompt he put into the orchestrator before launch:

"You are the orchestrator of a solo agency that sells ready-made websites to local businesses. You delegate read-only tasks to 6 sub-agents and own all writes.

sub-agents:

// Scout (walks through Google Maps in selected cities, looks for narrow niches: 5+ years on the map, fewer than 50 reviews, no website or a website from 2014, but high ratings)

// Diagnoser (for each lead writes a 50-word diagnosis, hero angle, tone matched to the industry, and a cold message under 70 words)

// Builder (generates a landing page mockup in Lovable through MCP only for the top 5 leads per day, with the sharpest diagnoses and the biggest gap)

// Filmer (pulls 5 screenshots of the mockup and through Higgsfield renders a 10-second vertical video 1080x1920 with a soft zoom)

// Pitcher (sends a personalized cold message through the right channel for the niche: email to roofers, SMS to tradesmen, IG DM to salons, LinkedIn to realtors)

// Checker (runs every message through evals for personalization, absence of AI markers and buzzwords before sending)

// Mobile (lives in the iPhone, handles positive replies in real time, books Zoom calls in Calendly through MCP while the owner is on the go).

You never let 2 sub-agents touch 1 lead. You stop and request approval from the human only when a deal exceeds $3,000 or the reply rate in a niche for the day drops below 12%."

Meaning the system knows what it is and within what boundaries it is allowed to act.

It knows it is supposed to find leads on its own.

It knows it is supposed to take each one to a mockup, video, and cold message without intervention.

It knows the human only steps in when a deal goes above $3,000 or the reply rate stops converging.

→ The system runs 24 hours a day

→ Scout goes through about 220 local businesses on Google Maps per day and leaves 30 new leads in the queue

→ Diagnoser outputs 30 structured diagnoses + briefs + cold messages per day

→ Builder assembles 3 to 5 finished landing pages in Lovable for the sharpest leads

→ Filmer renders a 10-second vertical video in Higgsfield for each one

→ Pitcher sends 30 personalized messages per day across 4 channels with a reply rate of about 14%

→ Checker runs every message through evals before sending

And only when a deal breaks $3,000 or the reply rate for the day drops below 12% does the orchestrator wake the owner.

And when the owner at that moment is sitting in the subway or a taxi, the Mobile agent in his iPhone picks up 1 move on its own: replies to a fresh positive reply from a dentist, books a Zoom through Calendly synced to the local time of the client, and puts the lead back in the queue. The owner only has to tap "approve" and in just 10 minutes join the call.

Here is what the system writes in his log during 1 of the Saturdays:

"scout report: 218 businesses checked in Austin, Denver, and Miami, 34 without a website, 19 with a website from 2014, 6 with an active redesign request in reviews. passing top 30 to diagnoser."

"pitcher: 30 cold messages sent across 4 channels, 14 replies, 5 positive, 3 Zoom calls booked for Sunday. passing to closer."

"builder: landing page for Westside Cosmetic Dentistry built in Lovable, 5 sections, mobile, soft beige. URL placed at /Users/dev/maps-agency/clients/westside/v1. filmer launching Higgsfield."

"eval flag: deal with The Lotus Salon at $3,400 exceeds the approved limit of $3,000. sending for manual review."

He has no server of his own and no separate backend.

Just a local file sandbox at /Users/dev/maps-agency, an MCP router, 1 API key to Claude, and the same key forwarded to Claude Code on his iPhone.

Out of everything I have seen this year, this is the cleanest one-person agency for selling websites to small businesses: $480 a month on the API, about $18,800 into the account, and between them 7 prompts, 1 file system, and 1 phone in the pocket.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b99b58bc-f814-4ba3-9b5d-6ad13ab33ea5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
