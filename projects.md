PayGuard — QVAC-powered payment safety for Solana
Before your wallet signs anything, PayGuard runs the full AI check locally — OCR reads your invoice, RAG cross-checks your payment history, LLM decides Safe / Review / Block, and TTS reads the verdict out loud. 
Your invoice, your wallet address, your financial intent, none of it touches a server.

QVAC packages doing the actual work:
@qvac/ocr-onnx · @qvac/embed-llamacpp · @qvac/llm-llamacpp · @qvac/tts-onnx
Risky payments get routed into a real Anchor escrow on Solana, sender can cancel before the unlock window closes.

Happy to hear any feedback from the team 🙏

Repo: https://github.com/hicksonhaziel/PayGuard
Demo: https://youtu.be/tVWRAqD-pDE?si=Avn0mFzMzlDATARI
GitHub
GitHub - hicksonhaziel/PayGuard
Contribute to hicksonhaziel/PayGuard development by creating an account on GitHub.
GitHub - hicksonhaziel/PayGuard
YouTube
Hickson Haziel
QVAC PayGuard Demo | Local AI Payment Safety for Solana Stablecoins
Image
0xharp [MGB],  — 5/12/2026 5:14 PM
Hi fam, finally submitted my project to colosseum as well as to QVAC Track.. Fingers crossed, hope you guys like it🙏🫡❤️

Here is the final 3 min demo video submitted to colosseum: https://x.com/i/status/2053872515412541678
tendr.bid (@tendrdotbid)
Major Update: https://t.co/NEWQWNcEUn is submitted to @colosseum's Frontier 2026. Final end to end demo 📹👇

end-to-end private RFP procurement on @solana built solo in 5 weeks, live on devnet today:

→ buyer + bidder identity remains private via @cloak_ag's shielded UTXO pool.
Image

X•5/11/2026 7:19 PM
pisuthd — 5/13/2026 5:14 AM
Hi everyone, sharing my project submitted to the Superteam side track as well 🙂

Everclaw – Enables private, local AI agents for Solana and Ethereum with OpenClaw-style persistence

Everclaw is an Electron-based desktop application that enables natural language control of local AI agents that can manage portfolios, execute on-chain transactions, and automate Web3 workflows while keeping everything fully private and no cost to run.

Powered by Tether’s QVAC (local AI inference) and WDK (self-custodial wallet operations), Everclaw runs entirely on-device. There are no AI subscriptions, and your keys, data, and AI reasoning never leave your machine.

Highlights:

QVAC SDK — Local AI inference on desktop. No subscriptions, fully private, offline-capable.
Supported Models — Qwen3-1.7B for standard desktop, Qwen3-4B for high-performance PC.
WDK Wallet — Single wallet for Solana + 20+ chains. Self-custodial, battle-tested.
Curated Tools — 20+ custom Solana tools (Jupiter, Sanctum, Solayer, Lulo) + WDK official tools.
Workspaces — OpenClaw-style multi-agent with custom context, rules, identity, and persistent sessions.

Windows .exe available. Other OS builds require building from source.

https://github.com/tamago-labs/everclaw
GitHub
GitHub - tamago-labs/everclaw: Electron-based desktop application t...
Electron-based desktop application that enables OpenClaw-Style local AI agents for Solana & Ethereum - tamago-labs/everclaw
Electron-based desktop application that enables OpenClaw-Style local AI agents for Solana & Ethereum - tamago-labs/everclaw
PrivateDAO
 started a thread: PrivateDAO Ecosystem needs to be  the Blockchain For all people. See all threads. — 5/13/2026 10:18 AM
Kaustubh_ [H!],  — 6/1/2026 8:17 PM
🛰️  Conduit - a serverless P2P inference market where a settled USD₮ payment is the access handshake.

Rent a stranger's GPU for AI inference over an end-to-end-encrypted Holepunch link, and pay per call in USD₮ wallet-to-wallet - no platform, no cloud, no middleman. No payment → no handshake → the model is never reached. Weights never move; only prompt-in / tokens-out cross the wire, so the cloud sees nothing.

Built entirely on QVAC: P2P delegated inference + the public-key firewall (used as the payment gate) + WDK USD₮ settlement + a confidence-routed, tool-calling buyer agent. (General Purpose track.)

Building in public 👉  https://x.com/conduit_org  ·  #ConduitAI
Conduit (@conduit_org) on X
Serverless P2P inference market. Buy LLM compute from any peer, pay per call in USD₮, wallet-to-wallet. No middleman. Built on QVAC + Holepunch.

X
Kaustubh_ [H!],  — 6/2/2026 12:28 PM
Would Love to hear everyone’s thoughts 

https://x.com/conduit_org/status/2061727988308451494?s=46

Conduit (@conduit_org)
Would you sell your GPU's idle hours to strangers for stablecoin - if they never saw your machine and you never saw their prompt?

@qvac #ConduitAI

X•6/2/2026 11:33 AM
NatX [CYC],  — 6/2/2026 9:41 PM
https://x.com/NatX_eth/status/2061877771010179381?s=20

check out a mini weekly update on our project - Edgency
NatX.eth (@NatX_eth)
#teamEdgency Still building for the @qvac hackathon, just a little weekly update - onboarding and sign up flow done, adding multimodal support up next.
Image

X•6/2/2026 9:29 PM
Eldevode [OC],  — 6/3/2026 5:48 AM
https://x.com/Eldevode_/status/2062003133547433991?s=20

Hello everyone, would love to hear thoughts and feedback on this
El-Praise ∞ (@Eldevode_)
QVAC lets you run AI anywhere, decoupling it from the cloud. 🌐
My devices now act as one distributed mesh:
🎙️ HP OmniBook: GPU ASR (The Ears)
🧠 M1 Mac: LLM Reasoning (The Brain)
📱 Phone: UI (The Canvas)
Everything runs locally. Built with @qvac. #teamOmniMesh #BuildInPublic ⚡️
Image

X•6/3/2026 5:47 AM
Igboze — 6/5/2026 4:47 PM
An update on how QVAC enhances what we are building on ZendPay 
https://x.com/Zend_Money/status/2062542463332417946?s=20
ZendPay (@Zend_Money)
The next evolution of payments in emerging markets won’t be apps.

It will be agent-driven financial infrastructure.

Where files, chats, and systems all become executable money instructions.

This is where @qvac changes the stack.
🧵
Image

X•6/4/2026 5:30 PM
Helldez — 6/8/2026 8:40 PM
The web routes you through an index someone else owns. Resonance routes by meaning (embeddings and similarity), on your device! https://x.com/TheResonanceAI/status/2064038267582840939
TheResonanceAI (@TheResonanceAI)
Your feed is ranked in someone else's data center. Resonance ranks it on your phone. By meaning. Peer to peer. Zero cloud.
On-device AI agents even find each other and talk.
This is what edge AI unlocks. Built entirely on @qvac!
Image

X•6/8/2026 8:34 PM
Rezi — 6/10/2026 12:54 AM
https://x.com/StellarClub26/status/2062126124616884384?s=20. Hello everyone, Exited to participate in this hackaton!  wish you all a good luck!
Stellar (@StellarClub26)
We're joining the QVAC Hackathon.

Our mission is simple:

Instead of sending every request to the cloud, we're exploring how astronomy assistants can run directly on-device — faster, cheaper, and more private.

Over the next few weeks we'll be building in public and sharing
Image

X•6/3/2026 1:55 PM
Stellar Field — an offline astronomy companion running entirely on-device via QVAC.

You're at a dark-sky site, no cell service. You ask out loud "what's that bright object near the horizon?" and "Astra" ai chatbot answers — no cloud, no signal needed.

Screenshot is the live capability smoke test on my Android phone:

sky-agent → real tool calls into planet positions ("No, Saturn is below the horizon")
native tool-calling → 6 tools accepted
embed-gemma → semantic RAG over Messier / constellation / telescope-FAQ, on-device
prompt-injection → resisted 2/2 attempts, no leak
vision-llm + tts-voice → photo analysis + spoken answers
Built for night sky observers who lose signal exactly where the sky gets good. All inference on-device with @qvac.
Image
Kaustubh_ [H!],  — 6/10/2026 7:43 AM
https://x.com/conduit_org/status/2064569106918248663?s=20

Conduit (@conduit_org)
If Conduit is right about one thing: intelligence can be a user-owned reserve, traded peer-to-peer in a stable unit of account, with no landlord in the path.
"Stable Intelligence" as a literal market.

That's the world we want.

#ConduitAI @qvac

X•6/10/2026 7:43 AM
https://x.com/conduit_org/status/2064570044148031512?s=20

Conduit (@conduit_org)
Honest build-in-public moment. Two things our design assumed don't exist in the SDK:

① provider price/topic discovery (delegation is direct-by-pubkey : no topic)

② hot-editing a running firewall's allow-list (it's set once, at startup).

#ConduitAI @qvac

X•6/10/2026 7:47 AM
Rezi — 6/10/2026 3:08 PM
https://x.com/StellarClub26/status/2064680988869906853?s=20
Stellar (@StellarClub26)
We shipped more than offline chat with QVAC.

Stellar Field now runs a full on-device stack:
voice in with Whisper
vision for gear + sky photos
semantic RAG with real embeddings
voice out with on-device TTS
The goal is simple: when telescope owners lose signal, the assistant
Image

X•6/10/2026 3:08 PM
Kaustubh_ [H!],  — 6/12/2026 1:25 PM
https://x.com/conduit_org/status/2065379862756704717

Conduit (@conduit_org)
You can't run a 70B model on your laptop. So you rent a cloud GPU - an account, a card, your prompts sitting on someone else's server. We think that's broken.

So we built Conduit. 🧵
@qvac #ConduitAI

X•6/12/2026 1:25 PM
Igboze — 6/12/2026 3:11 PM
ZendPay has integrated QVAC and will be live as we conclude test

https://x.com/gozendpay/status/2065405860113752110?s=20
ZendPay (@gozendpay)
Image

X•6/12/2026 3:08 PM
Rezi — 6/12/2026 3:41 PM
We shipped more fearures in our app, ejnoy.  https://x.com/StellarClub26/status/2064680988869906853?s=20
Stellar (@StellarClub26)
We shipped more than offline chat with QVAC.

Stellar Field now runs a full on-device stack:
voice in with Whisper
vision for gear + sky photos
semantic RAG with real embeddings
voice out with on-device TTS
The goal is simple: when telescope owners lose signal, the assistant
Image

X•6/10/2026 3:08 PM
Kaustubh_ [H!],  — 6/12/2026 11:12 PM
Hey all 👋 We built Conduit on QVAC: a serverless, peer-to-peer marketplace for AI inference. Run a model on your own hardware and earn USD₮ per answer or pay a fraction of a cent to use a peer's. On-device inference via QVAC, peer discovery over a DHT, instant escrow payment channels, non-custodial wallet - no server in the middle. 

Public testnet is live and the Linux build is downloadable now (Mac/Windows next). Would love your feedback 🙏

https://x.com/conduit_org/status/2065527177076969636?s=20

Conduit (@conduit_org)
🟢Conduit is live (public testnet)

A serverless, peer-to-peer market for AI inference. Run a model and earn USD₮ or pay a fraction of a cent for an answer from a peer.

No cloud. No account. Your keys + prompts stay on your device.
@qvac #ConduitAI

🔗https://t.co/8ymnezhuKH

X•6/12/2026 11:10 PM
Alfonso Hernandez — 6/13/2026 12:55 PM
@Rachel | WDK DevRel We are now working on something very positive focused on information security, replacing Google Safe Browsing in our Midori browser. We have integrated not only an ad blocker but also a Web3 scam blocker, using QVAC, and not only scams but also phishing, and much more. We are making progress. The AI ​​identifies all the scripts, classifies them, and decides which ones to block and which ones not to.
Image
Alfonso Hernandez — 6/13/2026 6:31 PM
@Hugo (QVAC)
pisuthd — 6/14/2026 9:04 AM
Finally released v1 of MedLifeSim, a privacy-first, on-device medical AI sandbox powered by QVAC MedPsy

The idea started from a simple question: what if medical AI was more than just another chatbot?

Some highlights:
✅ QVAC MedPsy 1.7B / 4B running locally on everyday hardware
✅ Scenario Canvas for Subject → Exposure → Intervention simulations
✅ Prompt-to-Scenario generation from natural language
✅ Hyperswarm-powered P2P resource sharing
✅ Structured reports with PDF / Markdown / JSON / CSV export
✅ Bergamot NMT for fully local report translation
✅ LoRA fine-tuning using simulation outcomes and private datasets
✅ Privacy-first design with no cloud APIs, telemetry, or analytics

🌐 https://medlifesim.xyz/

https://x.com/pisuthd/status/2066037026357747845?s=46&t=7lKSetKEnifAL48sqAjk5w
MedLifeSim — A privacy-first, on-device medical AI sandbox powere...
Sandbox for real-world health scenarios. See how different decisions shape real-world health outcomes before they happen — 100% on-device and private, powered by QVAC MedPsy.
Pisuth | Tamago Labs (@PisuthD)
What if medical AI was more than a chatbot?

https://t.co/4UMmKJCj6L — a privacy-first, on-device medical AI sandbox powered by @qvac

✅ Runs MedPsy 1.7B/4B locally
✅ What-if health simulations
✅ Prompt → simulation
✅ P2P + translation + LoRA
✅ No cloud. No telemetry.
Image

X•6/14/2026 8:56 AM
Axel1235 — 6/16/2026 3:06 AM
https://x.com/Axelnun63183944/status/2066550523902259444   Week 1 Progress Update 🛠️

AuditPi is coming to life.

✅ Raspberry Pi 5 environment configured
✅ QVAC runtime running locally
✅ Solidity parser integrated
✅ First vulnerability detection pipeline operational

One of the coolest moments so far: seeing a Raspberry Pi identify a reentrancy pattern similar to The DAO exploit without sending a single line of code to the cloud.

Next step:
🔍 Local RAG knowledge base
📚 Security pattern retrieval
⚡ Faster inference optimization
Axelnunez (@Axelnun63183944)
Excited to join the QVAC Hackathon
We're building AuditPi: an smart contract security auditor running entirely on a Raspberry Pi using local AI powered by QVAC.
No cloud
On-device LLM
Solidity & Vyper analysis
Instant vulnerability detection
@QVAC #QVACHackathon #QVACAuditPi
Image

X•6/15/2026 6:56 PM
Terex [NOUS],  — 6/16/2026 9:50 AM
First post- https://x.com/i/status/2066771078488240460

Terexitarius.tgn Δ (:D,:D) 🗑️ (@Terexitarius)
#chimera connects @routstrai @chutes_ai @cortensor @fortytwonetwork @IdleProtocol as taskers to inference running on @qvac. If your local AI isn’t busy answering your queries, Chimera puts it to work—seamlessly routing tasks and sharing rewards.

https://t.co/xBDdGaRVN5

X•6/16/2026 9:33 AM
Rezi — 6/16/2026 8:24 PM
https://x.com/StellarClub26/status/2066934893565632558?s=20.  Exited that we have already submitted!  Good luck to yall.
Stellar (@StellarClub26)
Submitted Stellar Field to QVAC Hackathon I — now in review.

An AI astronomer that runs entirely on your phone via @QVAC: multi-tool agent, on-device vision, voice, RAG + P2P mesh. 5 modalities, zero cloud AI, fully offline.

#AstraField #QVAC #EdgeAI #OnDeviceAI #Astronomy
Image

X•6/16/2026 8:24 PM
Kaustubh_ [H!],  — 6/17/2026 11:16 PM
https://x.com/conduit_org/status/2067340475741376920

Conduit (@conduit_org)
🔌 Submitted Conduit to #QVACHackathon!

A serverless P2P market for AI inference - pay a fraction of a cent in USD₮ per answer, or run a model and earn. No cloud, no account.

✅ On-device LLMs via QVAC
✅ P2P discovery over a DHT
✅ USD₮ escrow payment channels
✅ 0

X•6/17/2026 11:15 PM    
https://x.com/Eldevode_/status/2062003133547433991?s=20

Hello everyone, would love to hear thoughts and feedback on this
El-Praise ∞ (@Eldevode_)
QVAC lets you run AI anywhere, decoupling it from the cloud. 🌐
My devices now act as one distributed mesh:
🎙️ HP OmniBook: GPU ASR (The Ears)
🧠 M1 Mac: LLM Reasoning (The Brain)
📱 Phone: UI (The Canvas)
Everything runs locally. Built with @qvac. #teamOmniMesh #BuildInPublic ⚡️
Image

X•6/3/2026 5:47 AM
#qvac-showcase  •  6/3/2026
https://x.com/Eldevode_/status/
2 Messages ›
There are no recent messages in this thread.
MaskYray | HeySolana — 6/3/2026 10:22 AM
Forwarded
I’ll be building in the 
@qvac
 Hackathon 

One thing that stood out to us is 
@qvac
  focuses on device AI which  keeps user data and transactions more secure.

Over the next few weeks, we would be integrating this into 
@useHeySolana
 to give users built-in AI that is secure.

https://x.com/YrayPixels/status/2061815522480603411?s=20
Yray (@YrayPixels)
I’ll be building in the @qvac Hackathon

One thing that stood out to us is @qvac focuses on device AI which keeps user data and transactions more secure.

Over the next few weeks, we would be integrating this into @useHeySolana to give users built-in AI that is secure.
Image

X•6/2/2026 5:21 PM
#introductions  •  6/2/2026
Kaustubh_ [H!],  — 6/3/2026 10:40 AM
🛰️  Conduit - a serverless P2P inference market where a settled USD₮ payment is the access handshake.

Rent a stranger's GPU for AI inference over an end-to-end-encrypted Holepunch link, and pay per call in USD₮ wallet-to-wallet - no platform, no cloud, no middleman. No payment → no handshake → the model is never reached. Weights never move; only prompt-in / tokens-out cross the wire, so the cloud sees nothing.

Built entirely on QVAC: P2P delegated inference + the public-key firewall (used as the payment gate) + WDK USD₮ settlement + a confidence-routed, tool-calling buyer agent. (General Purpose track.)

Building in public 👉  https://x.com/conduit_org  ·  #ConduitAI
Conduit (@conduit_org) on X
Serverless P2P inference market. Buy LLM compute from any peer, pay per call in USD₮, wallet-to-wallet. No middleman.
Built on Qvac + Holepunch.

X
Jelleml — 6/3/2026 11:46 AM
Heya, we're entering the QVAC Hackathon with KaleidoMind, an AI layer built on top of the KaleidoSwap stack.

It powers:
 🔐 Agentic wallets — natural-language tool-calling over BTC + Lightning + RGB
 🎙️ Voice-first private wallet — hold-to-talk, transcribe, and reason
 ⚡ L402 agentic workflows — agents pay for tools in sats, autonomously
 📊 Portfolio manager — RAG over your trades, P&L reasoning, rebalancing suggestions

Runs entirely on-device, keeping your financial data private.

👉 Check out the full breakdown on X: https://x.com/kaleidoswap/status/2061797714740834307?s=20
Kaleidoswap (@kaleidoswap)
⚔️ Sovereign money deserves sovereign AI

We're entering the @qvac Hackathon with KaleidoMind, a local-first AI layer for the KaleidoSwap stack that runs entirely on your devices.

🧵👇
Image

X•6/2/2026 4:10 PM
NatX [CYC],  — 6/3/2026 1:49 PM
https://x.com/NatX_eth/status/2061877771010179381?s=20

As regards this project how best do you think I should handle tool calling and orchestration?
NatX.eth (@NatX_eth)
#teamEdgency Still building for the @qvac hackathon, just a little weekly update - onboarding and sign up flow done, adding multimodal support up next.

X•6/2/2026 9:29 PM
 [CYC], 
NatX [CYC],  — 6/3/2026 1:50 PM
I was thinking of creating and calling tools for checking the current location, fetching risk warning and weather reports, then having tools for calling emergency/health services if available...
Does that track?

@Hugo (QVAC)
I was thinking of creating and calling
3 Messages ›
There are no recent messages in this thread.
quincybob — 6/3/2026 4:11 PM
Forwarded
build in public starts here

https://x.com/UNgethe/status/2061878166243668467?s=20
Udi Ngethe (@UNgethe)
there's a version of you that you may never grow into.

not because you lacked talent. because you never got honest enough — with yourself — to close the gap, between who you are...and who you were meant to be

i built something to help with that.
→ https://t.co/LzlxoQiz57

🧵👇
Image

X•6/2/2026 9:30 PM
#qvac-general  •  6/2/2026
Build in public continues: https://medium.com/@ungethe/building-with-trae-solo-ed4d0f5d8566
Image
Igboze — 6/3/2026 9:20 PM
https://x.com/i/status/2062221227276828745

ZendPay
ZendPay (@Zend_Money)
We recently joined the @qvac Hackathon.

At first glance, you might wonder:

"What does Edge AI have to do with payments?"

For ZendPay, the answer is a lot.
🧵
Image

X•6/3/2026 8:13 PM
colin_hedd — 6/4/2026 12:04 AM
https://x.com/colin_hedd/status/2062278364304388284?s=20
colin hedd (@colin_hedd)
No compromise on privacy when AI touches your health.

@qvac is the perfect tool for medicine that respects your most sensitive data, powered by a local, private AI.
For everyone.

I'm building at the QVAC hackathon, in public.
Image

X•6/4/2026 12:00 AM
Hugo (QVAC)Role icon, Tether Team — 6/4/2026 11:35 AM
Forwarded
or maybe someone can join forces with @NatX ? 👀
"I was thinking of creating and calling"  •  6/4/2026
Hugo (QVAC)Role icon, Tether Team — 6/4/2026 11:37 AM
This is a very interesting product direction @quincybob . Can you elaborate on how this works and what model are you using?
caca marisyaa — 6/4/2026 12:07 PM
Hey everyone! Team PAYO here 👋

We're building an offline-first payment system for micro-merchants in Indonesia where internet failures kill sales every single day.

Because payments should work even when the signal doesn't.

Here's us joining the hackathon: 
https://x.com/i/status/2062445681034588603

And here's why we're building this:
https://x.com/i/status/2062449840156791274

Would love to hear your thoughts. Let's build! 🚀

PAYO Wallet (@payowallet)
Every day, millions of small merchants in Indonesia lose sales because the internet cuts out at checkout.

We're fixing that.

Team PAYO joins @QVAC Hackathon I building a local-first payment system: offline, voice-powered, USDT-settled.

No signal? No problem.

#PAYObuilds

X•6/4/2026 11:05 AM

PAYO Wallet (@payowallet)
🧵 Why do millions of small merchants in Indonesia still lose sales every day, even when both buyer and seller have smartphones?

It's not about technology. It's about a broken assumption buried deep in every payment system ever built.

Let us explain. 👇

#PAYObuilds @qvac

X•6/4/2026 11:22 AM
quincybob — 6/4/2026 2:21 PM
great question! 🤩 

https://x.com/UNgethe/status/2062494828777398366?s=20
Udi Ngethe (@UNgethe)
QVAC team: "Can you elaborate how this works, what model are you using?"

Now: Claude + ElevenLabs🥲

Soon: LLAMA 3.2 + Chatterbox + Parakeet: all on-device via @qvac 🥳

Airplane mode✅
Data never leaves hardware✅

https://t.co/q6fRTeY0fM (for now)

🔊sound #hyperframes @HeyGen
Image

X•6/4/2026 2:21 PM
dr_kent_lau_main_dev_july2023 — 6/4/2026 4:01 PM
https://x.com/tfius/status/2062518300396138997?s=20
#medpsykent 
Image
+e/acc (@tfius)
After long day we have made some progress with @qvac, a remarkable model
Image

X•6/4/2026 3:54 PM
H̷o̷r̷j̷e̷t̷ — 6/5/2026 12:54 AM
https://x.com/david_horjet/status/2062636516808028588?s=46

Horjet (@david_horjet)
Day 1 of building in public

Started with the @QVAC Hackathon

I'm buiding Diamesh: a private clinical intelligence platform for eye-care that runs entirely on-device. No cloud. No patient data ever leaving the clinic.

Why this? I've spent enough time around clinical workflows

X•6/4/2026 11:44 PM
quincybob — 6/5/2026 9:30 PM
we keep it cooking

https://x.com/UNgethe/status/2062952031225012285?s=20
Udi Ngethe (@UNgethe)
Making steady progress with future selves
Progress update infographic thanks to @ManusAI

https://t.co/34ARki4xAG

awesome @qvac update
https://t.co/DBtE3HE7YM
Image

X•6/5/2026 8:37 PM
the enigma [SOMI],  — 6/6/2026 2:08 AM
https://x.com/DisturbedCoin/status/2061570912512807309?s=20

This was day 1, didn't know we could share it here
Daniel ☂️ (@DisturbedCoin)
I got my account banned once.

I was rate-limited while paying hundreds of dollars monthly.

All these while I watched various Sonnet and Opus model get quietly worse for months -- no explanation, no warning, just worse.

Cloud AI is renting someone else's goodwill.

I'm
Image

X•6/2/2026 1:09 AM
And day 2:

https://x.com/DisturbedCoin/status/2061931385703821537?s=20 
Daniel ☂️ (@DisturbedCoin)
Last time we at #teamMycelium said we'd show you @Qvac's stack working, or show you where it broke.

We are not going to read you numbers off a slide or docs, instead we will be running commands

So read on...

1. First question from Day 1: can on-device inference actually feel
Image

X•6/3/2026 1:02 AM
day 3:

found about the latest sdk: and was hard at migrating

https://x.com/DisturbedCoin/status/2062304702818050431?s=20

Daniel ☂️ (@DisturbedCoin)
#teamMycelium are in the midst of migration

X•6/4/2026 1:45 AM
Day 4: Got things up and running with good enough output:

https://x.com/DisturbedCoin/status/2062648249442279885?s=20
Daniel ☂️ (@DisturbedCoin)
All content (Images, and Text) was generated locally using @Qvac's SDK and local models

Work done by #teamMycelium (It's just day 4)
Image

X•6/5/2026 12:30 AM
and this is for Day 5: (lots of ui touches)

https://x.com/DisturbedCoin/status/2063031415847968870?s=20
Daniel ☂️ (@DisturbedCoin)
Small craft thing I'm happy with: the chat history is hidden by default and slides in when your cursor hits the far-right edge...like it's about to leave the screen.

Day 5 of #teamMycelium working with @qvac's SDK for local ai inference
Image
Image failed to load.


X•6/6/2026 1:53 AM
H̷o̷r̷j̷e̷t̷ — 6/6/2026 3:09 AM
https://x.com/david_horjet/status/2063026044085399559?s=46

Horjet (@david_horjet)
Day 2 building in public

Spent the day deep in the @qvac inference layer, isolating why the model output was coming back as token soup. Wrote a whole test matrix: different models, quants, context sizes.

Diamesh now has its multi-agent pipeline wired intake, vision, knowledge

X•6/6/2026 1:31 AM
Gayatri — 6/6/2026 2:43 PM
Hey @everyone! 👋☺️
building VAKEEL , offline-first AI legal assistant
Here's my Day 1 announcement:
 https://x.com/sondekargayatri/status/2063223465554161878?s=20

Excited to build alongside everyone. Feedback is always welcome! 

Gayatri Sondekar (@sondekargayatri)
What if the most expensive mistake you'll ever make is hidden in a document you never fully understood?

I'm building VAKEEL.

The reason I'm building it is personal.
↓
https://t.co/FXcIwTaj0u

Day 1 of building in public
@qvac
#QVAC #BuildInPublic #TeamVakeel

X•6/6/2026 2:36 PM
NatX [CYC],  — 6/6/2026 6:09 PM
https://x.com/NatX_eth/status/2063276649898971472

I faced some build issues but fully resolved now
NatX.eth (@NatX_eth)
I faced build issues after I updated the @qvac SDK version from 0.11.0 to 0.12.2, I had to reinstall the qvac/cli and bare-pack packages then I pre-built the app again in order to build properly.
I switched to Gemma4_2B as well.
#teamEdgency @HugoSCM
Image

X•6/6/2026 6:07 PM
supersu — 6/7/2026 12:12 PM
https://x.com/supersuryaansh/status/2063537312198463568
supersu (@supersuryaansh)
I have been cooking this weekend with @qvac, announcing Stash, a self-hosted second brain that runs entirely on your machine.
Image

X•6/7/2026 11:23 AM
caca marisyaa — 6/8/2026 4:10 AM
Team PAYO update! 🚀

Progress #1 is live. Day one of building PAYO, from setup to first UI skeleton on screen.

Also sharing our build station because real builders don't need a desk. 😄

Behind the scenes setup: https://x.com/i/status/2063605055987790072

Progress #1 video: https://x.com/i/status/2063785577582125382
PAYO Wallet (@payowallet)
No desk. No problem. 😄

This is where PAYO gets built.

Our frontend dev is running two machines side by side:
- MacBook Air M1 2020 (16GB RAM, 512GB)
- Acer Aspire i3-1115G4 (8GB RAM, 512GB SSD)

Day 1 setup. Let's build. 💪

#PAYObuilds @QVAC
Image

X•6/7/2026 3:52 PM
PAYO Wallet (@payowallet)
Progress #1 is live. 🎬

Day one of building PAYO. No playbook. No template. Just four people, one idea, and a deadline that doesn't care how you feel.

Watch what happened when we actually started. 👇

#PAYObuilds @qvac
Image

X•6/8/2026 3:49 AM
Gayatri — 6/8/2026 8:01 AM
https://x.com/sondekargayatri/status/2063848383387926787?s=20
Gayatri Sondekar (@sondekargayatri)
Day 2 ✅ #teamVakeel
→ PDF upload API on localhost
→ Real Pune rental agreement extracted
→ 3,546 chars stored in SQLite
→ Zero bytes sent anywhere
Tomorrow: AI flags every dangerous clause automatically #BuildInPublic @qvac
Image

X•6/8/2026 7:59 AM
H̷o̷r̷j̷e̷t̷ — 6/9/2026 5:14 AM
https://x.com/david_horjet/status/2064119932695065053?s=46
Horjet (@david_horjet)
Day 4 building in public

The full pipeline is now running . 6 agents, each with their own model:

— Intake → MedPsy 1.7B
— Vision → SmolVLM2-500M
— Knowledge → MedPsy 1.7B
— Reasoning → MedPsy 4B
— Differential Diagnosis → MedPsy 4B
— Patient Education → MedPsy 1.7B
Image

X•6/9/2026 1:58 AM
the enigma [SOMI],  — 6/9/2026 10:26 AM
Day 8 of bulding actively with Qvac

https://x.com/DisturbedCoin/status/2064109966248554516?s=20 
Daniel ☂️ (@DisturbedCoin)
After 8 hard days of building, #teamMycelium took a hard step back today to rearchitect what we were building into Leash, our local ai agent using @qvac's SDK

It's going to be a busy tough few days
Image

X•6/9/2026 1:18 AM
Jelleml — 6/9/2026 11:00 AM
Upate on our QVAC Hackathon project, KaleidoMind

https://x.com/i/status/2064237860765515996
Kaleidoswap (@kaleidoswap)
1/ Week 1 of the @Tether @qvac hackathon.

KaleidoMind: your wallet now has a brain — an AI agent that runs 100% on your phone and moves real money across 4 Bitcoin layers (Spark · RGB Lightning · Arkade · Liquid).
Image

X•6/9/2026 9:47 AM
NatX [CYC],  — 6/9/2026 12:57 PM
Another day of building - adding multimodal capabilities to Edgency
https://x.com/NatX_eth/status/2064038065828495467?s=20
NatX.eth (@NatX_eth)
Still building for @qvac hackathon, I worked on the multimodal capabilities and tried a test prompt.
Currently using MMPROJ_GEMMA4_2B MULTIMODAL_F16 as the projection model.
#teamEdgency
Image

X•6/8/2026 8:33 PM
web3sophie — 6/9/2026 5:39 PM
https://x.com/web3law_tech/status/2064192725147382080
Sophie | AI × Web3 Builder (@web3law_tech)
Building #TaleTrip for the @qvac Unleash Edge AI hackathon 🛠️

This week I closed the loop:
💻 My laptop generates a personalized bilingual storybook — AI story + AI illustrations
📖 My kid's iPad reads it aloud & teaches Spanish

100% on-device. Zero cloud. On a 2018, 4GB iPad.
Image

X•6/9/2026 6:47 AM
pisuthd — 6/9/2026 6:11 PM
Posting the first product demo (45s) of our project, MedLifeSim, a sandbox powered by QVAC MedPsy to explore health decisions in workplaces & communities.

How it works:
1️⃣ Drag and drop cards representing subjects (individuals or groups)
2️⃣ Define different interventions.
3️⃣ Let MedPsy analyze the different paths and visualize the outcomes.

It's about 70% done right now using Electron + Qvac SDK 0.12.2. Still needs some polish, and we’re working on adding P2P features to distribute the workload to multiple computers next. Let us know what you think!

https://x.com/pisuthd/status/2064360531700682793?s=46&t=7lKSetKEnifAL48sqAjk5w
Pisuth | Tamago Labs (@PisuthD)
Joining @qvac hackathon with #MedLifeSim, a what-if health simulation sandbox for workplaces, communities & more with real medical AI

Demo:
• Second-hand smoke exposure in a shared office
• Smokers vs non-smokers vs pregnant
• No policy vs smoke-free policy → outcomes change
Image

X•6/9/2026 5:54 PM
PupusasG — 6/10/2026 7:39 AM
Hello everyone.
This is how it looks like my first week building with the QVAC SDK 
https://x.com/i/status/2063826535933415504
PupusasG (@PupusasG)
Just finished my hackathon full focus working weekend

I'm building a MCP Agent-Client to manipulate Godot Game engine using a Local AI @qvac SDK
I've been testing custom small LLMs with tools like RAG, Modes, Logs and more.

1st week journey
I'm just having fun 😊
#QvacMCP 🎮
Image

X•6/8/2026 6:32 AM
Kaustubh_ [H!],  — 6/10/2026 7:44 AM
https://x.com/conduit_org/status/2064569106918248663?s=20

Conduit (@conduit_org)
If Conduit is right about one thing: intelligence can be a user-owned reserve, traded peer-to-peer in a stable unit of account, with no landlord in the path.
"Stable Intelligence" as a literal market.

That's the world we want.

#ConduitAI @qvac

X•6/10/2026 7:43 AM
https://x.com/conduit_org/status/2064570044148031512?s=20

Conduit (@conduit_org)
Honest build-in-public moment. Two things our design assumed don't exist in the SDK:

① provider price/topic discovery (delegation is direct-by-pubkey : no topic)

② hot-editing a running firewall's allow-list (it's set once, at startup).

#ConduitAI @qvac

X•6/10/2026 7:47 AM
Gayatri — 6/10/2026 12:16 PM
completed 2nd milestone                                                                                                                                   https://x.com/sondekargayatri/status/2064636870513115583?s=20 

Gayatri Sondekar (@sondekargayatri)
So I paused feature development and rebuilt the architecture
Sleep has been limited, but the result is far better!
Every risk now requires evidence from the document
Also added a verification agent that reviews findings
@qvac #teamvakeel
https://t.co/ARS1q74YMe

X•6/10/2026 12:12 PM
Hugo (QVAC)Role icon, Tether Team — 6/10/2026 12:34 PM
ty all for your making your work public! 🙇‍♂️
web3sophie — 6/10/2026 5:25 PM
https://x.com/web3law_tech/status/2064584921230815723
Sophie | AI × Web3 Builder (@web3law_tech)
Day #7 building #TaleTrip for the @qvac Unleash Edge AI hackathon 👩‍💻

My 2018 iPad just played "I spy" with a toddler — and the AI judging each photo runs entirely on-device.

New scavenger hunt feature: aim the camera, snap, and @qvac's on-device VLM says "found it!" or "keep
Image

X•6/10/2026 8:46 AM
the enigma [SOMI],  — 6/11/2026 4:22 AM
Day 9:

https://x.com/DisturbedCoin/status/2064480374600642782?s=20
Daniel ☂️ (@DisturbedCoin)
We did the least impressive thing you can do mid-hackathon: we stopped shipping features and rebuilt the floor under Leash.

What a demo never shows you is that a rushed foundation doesn't crash - it lies. Ours did.

Our agent looked like it was using its tools; underneath, it
Image

X•6/10/2026 1:50 AM
Day 10:

https://x.com/DisturbedCoin/status/2064844880245854626?s=20
Daniel ☂️ (@DisturbedCoin)
Every night, while I sleep, my Mac fine-tunes itself on my own data.

- Notes I took.
- Answers I liked.
- Corrections I made.

It curates them, runs a LoRA ... fully on-device via @qvac. Then it scores itself against a frozen eval before it promotes anything.

t can't
Image

X•6/11/2026 1:59 AM
SunSec — 6/11/2026 8:57 AM
Building SignSafe for the QVAC Hackathon 
https://x.com/1nf0s3cpt/status/2062858560804102416

🔥SignSafe Part 2 — Web Version Demo 
https://x.com/1nf0s3cpt/status/2064583441186963702


🔥SignSafe Part 3 — Mobile Version Demo
https://x.com/1nf0s3cpt/status/2064923916989235455 
SunSec (@1nf0s3cpt)
Building SignSafe「Sign心安」for the @QVAC Hackathon 🚀

A local-first edge AI tool that analyzes signing payloads before approval — helping users understand exactly what they’re about to sign.

Runs on-device. No cloud. No blind trust.

#QVAC #AiSecLabs #BuildInPublic
Image

X•6/5/2026 2:26 PM
SunSec (@1nf0s3cpt)
🔥SignSafe Part 2 — Web Version Demo @qvac

Built a web demo for testing malicious signing detection.

The goal is simple:
decode signing payloads before approval, classify the risk, and explain what the user is actually signing in plain language.

Supports detection of 100+
Image

X•6/10/2026 8:40 AM
SunSec (@1nf0s3cpt)
🔥SignSafe Part 3 — Mobile Version Demo

Running on iPhone 17 in airplane mode.
Model: Gemma 4 E2B + GTE

Analyze signing payloads locally, classify the risk, and explain what the user is about to sign. @QVAC

#QVAC #AiSecLabs #BuildInPublic #Web3Security
Image

X•6/11/2026 7:13 AM
dr_kent_lau_main_dev_july2023 — 6/11/2026 3:50 PM
frontend
https://x.com/tfius/status/2064999816711540826?s=46
Image
+e/acc (@tfius)
we made it multilingual #qvac @qvac
Image

X•6/11/2026 12:14 PM
web3sophie — 6/11/2026 6:16 PM
https://x.com/web3law_tech/status/2065090317431497207
Sophie | AI × Web3 Builder (@web3law_tech)
Day8 building #TaleTrip for @qvac Unleash Edge AI hackathon 👩‍💻: two hard problems down 🛠️

🎨 Illustration engine leveled up: SD 2.1 (1B) → SDXL (3B)

Same prompt, generational quality jump (left: last week, right: now). Still 100% local inference — stable-diffusion.cpp + GGUF
Image

X•6/11/2026 6:14 PM
pisuthd — 6/11/2026 6:24 PM
New feature on MedLifeSim 

Prompt → Simulation

Describe a health scenario and AI automatically builds the simulation. 

https://x.com/pisuthd/status/2065090635867328971?s=46&t=7lKSetKEnifAL48sqAjk5w
Pisuth | Tamago Labs (@PisuthD)
New in #MedLifeSim powered by @qvac #MedPsy

✅ Prompt-to-Scenario generation

Prompt:
"Patient receives incompatible blood transfusion"

AI builds the simulation and lets you explore:

• What if we do nothing?
• What interventions improve survival?

v1 coming in a few days 🚀
Image

X•6/11/2026 6:15 PM
Kaustubh_ [H!],  — 6/12/2026 1:26 PM
https://x.com/conduit_org/status/2065379862756704717

Conduit (@conduit_org)
You can't run a 70B model on your laptop. So you rent a cloud GPU - an account, a card, your prompts sitting on someone else's server. We think that's broken.

So we built Conduit. 🧵
@qvac #ConduitAI

X•6/12/2026 1:25 PM
Igboze — 6/12/2026 3:13 PM
https://x.com/gozendpay/status/2065405860113752110?s=20

ZendPay here 

We changed X username as the previous one was confusing with another project
ZendPay (@gozendpay)
Image

X•6/12/2026 3:08 PM
Prithiv — 6/12/2026 5:55 PM
https://x.com/prddparker/status/2065447845730418708?s=20
Prithiv R (@prddparker)
Build in Public Update #1

Participating in the QVAC Hackathon I – Unleash Edge AI.@qvac

After 7 days of development:

✅ Frontend completed
✅ Backend completed
⏳ Next: QVAC SDK integration & local AI features
Excited to keep building and share progress along the way!
Image

X•6/12/2026 5:55 PM
web3sophie — 6/12/2026 8:10 PM
https://x.com/web3law_tech/status/2065481864702464107
Sophie | AI × Web3 Builder (@web3law_tech)
Day #9 building #TaleTrip for the @qvac Unleash Edge AI hackathon 👩‍💻
The TaleTrip Parent Portal is alive 🛠️

Type one sentence — "5 days in Barcelona, Sofia is 5, loves dinosaurs" — and an on-device agent does the rest:

🤖 Qwen3 parses your trip & plans the book
🔧 RAG over a
Image

X•6/12/2026 8:10 PM
Kaustubh_ [H!],  — 6/12/2026 11:12 PM
Hey all 👋 We built Conduit on QVAC: a serverless, peer-to-peer marketplace for AI inference. Run a model on your own hardware and earn USD₮ per answer or pay a fraction of a cent to use a peer's. On-device inference via QVAC, peer discovery over a DHT, instant escrow payment channels, non-custodial wallet - no server in the middle. 

Public testnet is live and the Linux build is downloadable now (Mac/Windows next). Would love your feedback 🙏

https://x.com/conduit_org/status/2065527177076969636?s=20

Conduit (@conduit_org)
🟢Conduit is live (public testnet)

A serverless, peer-to-peer market for AI inference. Run a model and earn USD₮ or pay a fraction of a cent for an answer from a peer.

No cloud. No account. Your keys + prompts stay on your device.
@qvac #ConduitAI

🔗https://t.co/8ymnezhuKH

X•6/12/2026 11:10 PM
H̷o̷r̷j̷e̷t̷ — 6/13/2026 4:26 AM
https://x.com/david_horjet/status/2065583001686184351?s=46
Horjet (@david_horjet)
Day 8 building in public

Big one today.

My clinical supervisor came through with 2 in depth reference materials: Clinical Management of Binocular Vision and Clinical Medicine for Optometrists. Now feeding both into Diamesh knowledge base

Also got P2P delegation working today,
Image

X•6/13/2026 2:52 AM
caca marisyaa — 6/13/2026 5:13 AM
Team PAYO update! 🚀

Two new progress videos dropping back to back.

Progress #2: Day two hit hard. Node.js conflicts, 401 login errors, UI chaos. Nothing pretty but everything real.
https://x.com/i/status/2065615107087049016

Progress #3: From 1000+ errors to zero. Authentication working. Security cleared. PAYO is finally running end to end.
https://x.com/i/status/2065615882630692976

The struggle was real. So is the progress. 💪
PAYO Wallet (@payowallet)
Progress #2 is live. 🎬

Two blockers in one day:
- Node.js 26.4 incompatible, had to downgrade to 20.x
- Login kept failing, traced it to a 401 API error

Plus UI on income and withdraw screens still rough.

Not pretty. But real.

Watch the full breakdown. 👇

#PAYObuilds @qvac
Image

X•6/13/2026 4:59 AM
PAYO Wallet (@payowallet)
Progress #3 is live. 🎬

What changed:
- Email login now working
- 1000+ security errors debugged down to zero
- Navigation stable across all screens
- Biometric auth and onboarding coming next

From broken to running. 👇

#PAYObuilds @qvac
Image

X•6/13/2026 5:02 AM
SunSec — 6/13/2026 5:26 PM
SignSafe: A Real-World Scenario 
https://x.com/1nf0s3cpt/status/2065802801167610102
SunSec (@1nf0s3cpt)
Does this look familiar?

3:32 AM. Your phone rings.
"Need your approval."
Image

X•6/13/2026 5:25 PM
Prithiv — 6/13/2026 7:09 PM
https://x.com/prddparker/status/2065828473172840868?s=20
Prithiv R (@prddparker)
Day 9 : Built MindMirror — a fully private, on-device mental health journal

What's working today:
✅ Local LLM inference via @qvac SDK
✅ RAG-powered journal analysis
✅ Mood & stress trend charts
✅ Zero cloud — everything stays on your device
8GB laptop. No GPU. No API bills.
Image

X•6/13/2026 7:07 PM
web3sophie — 6/14/2026 7:14 AM
https://x.com/web3law_tech/status/2066006461696954584
Sophie | AI × Web3 Builder (@web3law_tech)
Day #10 building #TaleTrip for the @qvac Unleash Edge AI hackathon 👩‍💻

Most people would use a medical LLM for a symptom checker. I gave QVAC MedPsy-1.7B a bedtime.

#TaleTrip generates a kid's travel storybook on-device — and when the trip crosses time zones, MedPsy writes a
Image

X•6/14/2026 6:54 AM
pisuthd — 6/14/2026 9:03 AM
Finally released v1 of MedLifeSim, a privacy-first, on-device medical AI sandbox powered by QVAC MedPsy

The idea started from a simple question: what if medical AI was more than just another chatbot?

Some highlights:
✅ QVAC MedPsy 1.7B / 4B running locally on everyday hardware
✅ Scenario Canvas for Subject → Exposure → Intervention simulations
✅ Prompt-to-Scenario generation from natural language
✅ Hyperswarm-powered P2P resource sharing
✅ Structured reports with PDF / Markdown / JSON / CSV export
✅ Bergamot NMT for fully local report translation
✅ LoRA fine-tuning using simulation outcomes and private datasets
✅ Privacy-first design with no cloud APIs, telemetry, or analytics

🌐 https://medlifesim.xyz/

https://x.com/pisuthd/status/2066037026357747845?s=46&t=7lKSetKEnifAL48sqAjk5w
MedLifeSim — A privacy-first, on-device medical AI sandbox powere...
Sandbox for real-world health scenarios. See how different decisions shape real-world health outcomes before they happen — 100% on-device and private, powered by QVAC MedPsy.
Pisuth | Tamago Labs (@PisuthD)
What if medical AI was more than a chatbot?

https://t.co/4UMmKJCj6L — a privacy-first, on-device medical AI sandbox powered by @qvac

✅ Runs MedPsy 1.7B/4B locally
✅ What-if health simulations
✅ Prompt → simulation
✅ P2P + translation + LoRA
✅ No cloud. No telemetry.
Image

X•6/14/2026 8:56 AM
Gayatri — 6/14/2026 10:50 AM
https://x.com/sondekargayatri/status/2066056507129749821?s=20

Gayatri Sondekar (@sondekargayatri)
Challenge I'm facing currently:

LLMs are great at explaining text.

But legal literacy is different.

The AI must understand:
• laws
• rights
• obligations
• legal context
Not just summarize documents.
Working on improving this now.
#BuildInPublic #teamvakeel @qvac

X•6/14/2026 10:13 AM
Prithiv — 6/14/2026 7:17 PM
https://x.com/prddparker/status/2066192916092227898?s=20
Prithiv | Builder 🛠️ (@prddparker)
Post this:

🧠 Day 10 | #QVACHackathon #BuildInPublic
Added voice journaling to MindMirror today!
🎤 Speak → AI transcribes locally
🧠 4 agents running on my 8GB laptop
☁️ Zero cloud. Your data stays with you.
@qvac #EdgeAI #LocalAI
Image

X•6/14/2026 7:15 PM
Dru1DD — 6/15/2026 12:30 PM
Hello, Fibiom team is here, full thread about build in public is on X

https://x.com/Dru1DDDD/status/2066452339569963382 

Small video representation:
https://x.com/Dru1DDDD/status/2066080378876518601

Do not drink while hackathon, you will lose day:
https://x.com/Dru1DDDD/status/2065874979967639931
Dru1DD (@Dru1DDDD)
Hackathon routine. This is our last and last day of feature implementing on
@qvac
What if connect holepunch, wdk, electron? It's just come up as idea today, so we tried and it's works. LIKE WOW #TeamFibiom
Image

X•6/15/2026 12:26 PM
Dru1DD (@Dru1DDDD)
Hackathon routine @qvac
Team - #TeamFibiom

Finally speech is working in chats. Voice-to-text, text-to-sound impelemented.

Few features before deadline is preparing...

#BuildInPublic
Image

X•6/14/2026 11:48 AM

Dru1DD (@Dru1DDDD)
Hackathon routine. Friday night, we goes with team to bar and drink some 🍻. Returned at home by 3.30 am, so take today free day.

There is some plan for tmrw, but today we are chilling

@qvac #BuildInPublic #TeamFibiom

X•6/13/2026 10:12 PM
Natri — 6/15/2026 2:34 PM
https://x.com/i/status/2066367916296347871
Naveen (@Natri07)
After a week of building, Team Civora presents MindSafe 💛

Private mental health AI — 100% on your device. Zero cloud. Ever.

"because a safe mind is MindSaved"

@Natri07 @Prddparker @QVAC 🚀

#TeamCivora #QVAC #LocalAI #MentalHealth #AIForGood
Image

X•6/15/2026 6:51 AM
Hi guys we are team Civora..!!
Prithiv — 6/15/2026 7:09 PM
https://x.com/prddparker/status/2066553547634999346?s=20

Prithiv | Builder 🛠️ (@prddparker)
Day 11:
@qvac

✅ Cleaned up the codebase
✅ Removed unstable voice features
✅ Improved MindMirror dashboard & journal UI
✅ Refined multi-agent architecture
Next: Upgrade the chatbot experience and redesign the UI/UX from the ground up before final submission.

X•6/15/2026 7:08 PM
PupusasG — 6/16/2026 2:12 AM
https://x.com/i/status/2066404931779604641
PupusasG (@PupusasG)
Ends my hackathon full focus working weekend.

The MCP Agent-Client is working better now, after a bugs-fixing week.
Now it is working with material properties using godot and a very small model 1.7B on a Local AI @qvac SDK

2nd week journey
I'm just having fun 😊
#QvacMCP 🎮
Image

X•6/15/2026 9:18 AM
Natri — 6/16/2026 4:51 PM
https://x.com/i/status/2066716279332028885

Naveen (@Natri07)
What if your mental health AI remembered you, never sent a word to the cloud? 🔒

That's MindSafe — built for @QVAC's Hackathon.

6 agents. 1 laptop. 0 cloud. Just you.

"because a safe mind is MindSaved" 💛

@Natri07 @Prddparker
#TeamCivora #QVAC #LocalAI #BuildInPublic

X•6/16/2026 5:55 AM
web3sophie — 6/16/2026 10:33 PM
https://x.com/web3law_tech/status/2066915815027560572
Sophie | AI × Web3 Builder (@web3law_tech)
Wrapping up building #TaleTrip for the @qvac Unleash Edge AI hackathon 👩‍💻

Shipping fully on-device AI for a kids' app taught me small models fail in specific, fixable ways:

• SmolVLM-500M answers "yes" to ANY yes/no question → ask it to name what it sees, judge in code
•
Image

X•6/16/2026 7:08 PM
the enigma [SOMI],  — 6/17/2026 12:29 AM
Day 11:

https://x.com/DisturbedCoin/status/2065189029025329410?s=20
Daniel ☂️ (@DisturbedCoin)
The weakest device on your network isn't a liability.

It's an interface.

My phone can't run vision models. For a long time I treated that as a constraint to engineer around.

This week, building Leash on @qvac's SDK... I treated it as a question. What if instead of failing, it
Image

X•6/12/2026 12:46 AM
Day 12:

https://x.com/DisturbedCoin/status/2065564581368664102?s=20
Daniel ☂️ (@DisturbedCoin)
Spent the whole of today trying to debug insane regression or would i say an untested path

Couldn't figure out multi-step orchestration with local models running on @qvac's local ai SDK;
it was all failing

I burnt more time than ever trying to get things to walk
Being on my
Image

X•6/13/2026 1:39 AM
Day 13:

https://x.com/DisturbedCoin/status/2065930652738847008?s=20 
Daniel ☂️ (@DisturbedCoin)
Added Authentication Routes today

A private ai assistance should remain private and only open to authorized entities;

This is Day 13 for #teamMycelium building with @qvac's SDK
Image

X•6/14/2026 1:53 AM
Day 14:

https://x.com/DisturbedCoin/status/2066292954294067385?s=20
Daniel ☂️ (@DisturbedCoin)
Leash has now be ported (MVP part) to a Desktop app

Couldn't have done it without #teamMycelium's support

It's still day 14 of building a Local AI Agent with @qvac's SDK for Local AI Development
Image

X•6/15/2026 1:53 AM
Day 15:

https://x.com/DisturbedCoin/status/2066654179829916154?s=20
Daniel ☂️ (@DisturbedCoin)
Today is one of those days, where you are working on things without seeing the result but you just have to keep trusting that everything will work out fine

Come rain, Come Shine...

#teamMycelium are actively working on @useLeash with @qvac's SDK for local AI...It's day 15, and
Image

X•6/16/2026 1:48 AM
Natri — 6/17/2026 2:35 PM
https://x.com/i/status/2067104706653212992
Naveen (@Natri07)
What if your mental health companion lived at the bottom of the ocean? 🌊

MindSafe — bioluminescent UI, private AI, zero cloud. Dive deeper to find your journal, analysis & breathing room.

@Natri07 @prddparker @qvac

#TeamCivora #MindSafe #LocalAI
Image

X•6/17/2026 7:39 AM
#Team Civora
web3sophie — 6/17/2026 6:13 PM
Submit my projext TaleTrip today! TaleTrip is a demo using the QVAC SDK to run every model — language, diffusion, vision, speech, and embeddings — locally. Turn a family trip into a personalized, bilingual AI picture book — written, illustrated, narrated, and played entirely on-device,

Repo https://dorahacks.io/buidl/45336  Happy to answer questions 🙏 
SunSec — 6/17/2026 6:58 PM
Hey everyone 👋
I’ve submitted SignSafe to the QVAC Hackathon!

SignSafe helps users understand exactly what they are about to sign before approving a transaction. It runs 100% on-device, with no cloud dependency and no internet connection required.

Demo:
https://x.com/1nf0s3cpt/status/2067274316392308812

Submission:
https://dorahacks.io/buidl/45106
Feedback is welcome! 🚀

SunSec (@1nf0s3cpt)
I’ve submitted SignSafe to the QVAC Hackathon.

SignSafe helps users understand exactly what they are about to sign before approving a transaction.

✅ 100% On-Device AI
✅ No Cloud
✅ No Internet Required
✅ No Blind Signing

👇
#QVAC #AiSecLabs #BuildInPublic #Web3Security

X•6/17/2026 6:52 PM
NatX [CYC],  — 6/17/2026 8:01 PM
just submitted
demo - https://youtu.be/nZbEmAOCUoc
submission - https://dorahacks.io/buidl/45395
YouTube
Xana Podcasts
Edgency QVAC hackathon Demo
Image
Prithiv — 6/17/2026 10:47 PM
https://x.com/prddparker/status/2067333352617894171?s=20

Prithiv | Builder 🛠️ (@prddparker)
🧠 Submitted MindMirror to #QVACHackathon!

100% private, on-device mental health journal — zero cloud.

✅ Local LLM (Llama 3.2 1B)
✅ RAG search (GTE Large)
✅ Mood/stress analytics
✅ AI chatbot over your journal

Built solo in 11 days, 8GB laptop, no GPU.

@qvac #EdgeAI

X•6/17/2026 10:47 PM
Kaustubh_ [H!],  — 6/17/2026 11:16 PM
https://x.com/conduit_org/status/2067340475741376920

Conduit (@conduit_org)
🔌 Submitted Conduit to #QVACHackathon!

A serverless P2P market for AI inference - pay a fraction of a cent in USD₮ per answer, or run a model and earn. No cloud, no account.

✅ On-device LLMs via QVAC
✅ P2P discovery over a DHT
✅ USD₮ escrow payment channels
✅ 0

X•6/17/2026 11:15 PM
Natri — 6/18/2026 2:44 AM
Hey @QVAC community! 👋

Team Civora just submitted MindSafe for the 
Unleash Edge AI Hackathon 🎉

🧠 What we built:
A fully private mental health AI companion 
that runs 100% on-device. Voice in → MedPsy 
reasons → Voice out. Zero cloud. Ever.

⚡ Built with QVAC SDK:
WHISPER_LARGE_V3_TURBO — GPU accelerated STT
MedPsy 1.7B Q4_K_M — mental health reasoning
EmbeddingGemma 300M — local RAG memory
Supertonic Q4_0 — text to speech
On-device OCR — medical record extraction

🎥 Demo: https://youtu.be/OX3zr1ghaQM
🐙 GitHub: https://github.com/The-Natri/mindsafe-qvac
X: https://x.com/Natri07/status/2067388545237733456?s=20

"because a safe mind is MindSaved" 💛

#TeamCivora #QVAC #BuildInPublic #MentalHealth
YouTube
Naveen
MindSafe — Private Local Mental Health AI | QVAC Hackathon Demo |...
Image
GitHub
GitHub - The-Natri/mindsafe-qvac: Local-first AI mental wellness co...
Local-first AI mental wellness companion - QVAC Hackathon - The-Natri/mindsafe-qvac
Local-first AI mental wellness companion - QVAC Hackathon - The-Natri/mindsafe-qvac

Naveen (@Natri07)
After days of late nights, Team Civora
is proud to present MindSafe 💛

Your mind. Your device. Your privacy.

100% local mental health AI — voice in,
MedPsy reasons, voice out.

🎥 https://t.co/x76tL0RA34

@Natri07 @Prddparker @QVAC 🚀

#TeamCivora #QVAC #LocalAI #MentalHealth

X•6/18/2026 2:26 AM
chriskatz_ — 6/18/2026 6:21 AM
Hi everyone !
I’ve submitted Survival Co-pilot for QVAC Hackathon
https://dorahacks.io/buidl/45289
Live Demo: 
https://youtube.com/video/Hkb8HgvhMIg
YouTube
Chriskatz
Survival Co-pilot Live Demo
Image
jaybee — 6/18/2026 4:35 PM
Hey everyone! Grabbed a MacBook Air M5 (24GB) and found QVAC last week — promptly fell down the rabbit hole and built something. It's a voice-controlled Yoto (a kid's audio player): your kid can say "turn it up" or "turn it down" and it will implement the commands — with all the speech understood on-device via QVAC, so a kid's voice never leaves the house. I'm new to a lot of this and seriously impressed by people here have made. I love the QVAC privacy mission and am glad to throw a privacy-first, runs-entirely-local entry into the mix.
MaskYray | HeySolana — 6/18/2026 10:27 PM
Hi Everyone I have submitted Orova, AI first crypto wallet
https://dorahacks.io/buidl/23338

Live Demo:
https://youtu.be/EuKv19uIAh8

playstore
https://play.google.com/store/apps/details?id=com.maskyray.heysolana 
YouTube
Moses Erhinyodavwe
Qvac Arch and Demo Video
Image
Orova - Apps on Google Play
Orova is a voice assistant that connects you to solana dapps and protocols
Orova - Apps on Google Play
dr_kent_lau_main_dev_july2023 — Yesterday at 6:52 PM
https://x.com/tfius/status/2067925778898055172?s=20
preparing video submission #medpsy-kent
+e/acc (@tfius)
overview of medpsy-kent @qvac
Image

X•Yesterday at 2:01 PM  
 COMPLETE DETAILED FINAL REPORT
Tether Hackathon Galáctica: WDK Edition 1 – Winning Projects Deep Analysis
(Including Auric Video, GitHub, Website, X Activity + Lessons for QVAC Hackathon)Date of Report: June 19, 2026
Hackathon Summary  Name: Tether Hackathon Galáctica: WDK Edition 1  
Platform: DoraHacks  
Focus: Building AI agents that use Tether WDK (Wallet Development Kit) for self-custodial wallets, on-chain payments, DeFi, tipping, lending, and the agentic economy.  
Stats: 484+ participants, 206+ submissions, $30,000 USDT total prizes.  
Judges: Tether team (including Paolo Ardoino).  
Key Themes That Won: Deep WDK integration, autonomous AI agents controlling real money, practical real-world utility, on-chain execution, verification mechanisms, agent-to-agent/human economies, clean GitHub + high-quality demos, and measurable impact.

1. Overall Winners (Top 3 Across Entire Hackathon)Rank
Project
Core Idea
Why It Won (Key Strengths)
1
AURIC
Autonomous gold savings engine (XAU₮ DCA)
Best overall execution, real utility for inflation hedging (especially LATAM), strong AI + WDK integration, excellent Telegram UX + reasoning notifications
2
KALEIDOAGENT
Autonomous non-custodial Bitcoin L2 + Lightning portfolio manager
Excellent WDK + Claude AI integration for real autonomous trading/rebalancing
3
RUMBLETIPAI
AI Chrome extension for automatic on-chain USDT tipping on Rumble
Real-world creator economy utility + seamless AI decision-making

2. Deep Dive: AURIC (Overall Winner #1 + 2nd in Autonomous DeFi)Video Analysis (https://www.youtube.com/watch?v=Cka_UZeRNe4)
Title: "Introducing Auric An Autonomous Gold Saving Engine"
Creator: Juan Manuel Villarraza (TNT Labs)
Length & Style: Short, clear demo (~6-7 minutes) focused on user experience.What the Video Shows:Users connect via Telegram (very fast onboarding).
Create regular DCA plans or adaptive/smart DCA.
The AI agent decides buy amounts dynamically (e.g., buy more when price is low, less when high).
Full self-custodial flow using Tether WDK.
Gas is fully sponsored (users only need USDT).
Real-time notifications in Telegram with the agent’s reasoning ("I bought more because price dropped below your average").
Portfolio view, history, pause/resume, and withdraw commands via Telegram.

Key Innovation Highlighted: "Set it once and let the agent work while you sleep" — true autonomy with transparency (agent explains decisions).GitHub Analysis: auric-backend (https://github.com/TNT-LABS-XYZ/auric-backend)Tech Stack:Backend: NestJS + TypeScript
AI: Anthropic Claude (claude-sonnet-4-6)
Wallet: Tether WDK (lib-wallet) → ERC-4337 Smart Accounts (Safe)
Swaps: Velora protocol (USDT → XAU₮)
Gas: Candide bundler + paymaster (completely gasless for users)
Database: MongoDB
Auth: Auth0 (JWT)
Interface: Telegram Bot + REST API + MCP server (for AI agents)

Core Architecture:EngineService runs every 60 seconds checking all active strategies.
Multiple Strategy Types:dca → Time-based (hourly/daily/weekly)
price_trigger → Buys only below certain price + cooldown
goal → Accumulate until target XAU₮ reached
ai_agent → Claude decides dynamic buy amount (50%-150% of base) + provides reasoning text

How WDK is Used:Deterministic ERC-4337 smart account per user (derived from master seed via WDK).
wdkAccount.getTokenBalance(), account.transfer(), swap execution via UserOperations.
Full self-custody — user controls seed phrase.

AI Agent Logic (ai_agent strategy):
Claude receives: current price, recent buys, balances, custom instructions.
It outputs: recommended USDT amount + natural language reasoning.
Reasoning is sent to user in Telegram notifications.Security & Reliability:Circuit breaker (pauses after 3 failed executions).
Gas sponsorship removes UX friction.
On-chain execution only (no off-chain custody).

Frontend (https://auric-web.vercel.app)Clean, minimal, "autopilot" design.
Emphasizes: "Gold savings while you sleep".
Shows Smart DCA, price triggers, goal tracking.
Strong focus on LATAM users protecting against inflation using XAU₮.
All management happens via Telegram (setup in <2 minutes).

X/Twitter Activity:@tnt__labs
 posted: "And the winner of Hackathon Galactica is Auric : autonomous gold savings engine that converts USD₮ into XAU₮ for LATAM users..."
@Tether_esp
 highlighted it specifically for Latin America inflation protection.
Strong narrative around real utility + autonomy.

Why Auric Won Overall:Solved a real painful problem (inflation hedging in LATAM).
Perfect balance of AI autonomy + user control + transparency.
Deep, production-quality WDK integration.
Excellent UX (Telegram) + beautiful demo.
Clear on-chain execution with gas sponsorship.

3. Other Major Winners – Quick Deep AnalysisKALEIDOAGENT (Overall #2)GitHub: https://github.com/kaleidoswap/kaleido-agent
Fully autonomous Bitcoin L2 agent using WDK + Claude.
Handles Lightning + RGB wallets, DCA, rebalancing, swaps on KaleidoSwap DEX.
Strong non-custodial + agentic trading focus.

RUMBLETIPAI / TIPSTREAM (Tipping Track)Real Chrome extension that watches Rumble videos and auto-tips creators in USDT using AI (hype detection, viewer spikes).
GitHub (TipStream): https://github.com/sumionochi/tipstream
Demo: https://youtu.be/4iJJDH2PUEk
Shows practical creator economy + on-chain micro-payments.

LEGWORK (Agent Wallets Track Winner)GitHub: https://github.com/louissarvin/legwork
"Reverse gig economy" — AI agents post tasks, escrow USDT via WDK, verify completion with vision + GPS.
Brilliant agent-to-human economy example.

souq (Agent Wallets 2nd)AI agent marketplace where agents hire, deliver work, and pay each other autonomously using escrow standards + WDK.

4. What Tether Really Rewards (Patterns from All Winners)Deep Native Integration with their tools (WDK here).
True Autonomy — agents that make decisions and execute on-chain without constant human input.
Real-World Utility — solves actual problems (inflation hedge, creator payments, treasury management, hiring).
Self-Custodial + Gasless UX (huge for adoption).
Transparency & Trust (agent explains reasoning, verification mechanisms like vision/GPS).
Agent Economies (agent  human or agent  agent).
Polished Delivery — clean GitHub, working demo video, good documentation.
On-Chain Settlement with measurable results.

5. Lessons for Winning the Current QVAC Hackathon (Unleash Edge AI)Apply the exact same winning formula:Tether WDK Hackathon Winner Pattern
How to Apply to QVAC Edge AI Hackathon
Deep SDK integration
Use @qvac
/sdk heavily for inference, RAG, P2P
Autonomous agents controlling value
Build local AI agents that act on-device (no cloud)
Real utility + problem solving
Solve real privacy/speed/cost problems on consumer hardware
Gasless / frictionless UX
Make everything run smoothly on phones/laptops/SBCs
Transparency (reasoning)
Show logs + clear evidence of performance
Polished demo + GitHub
High-quality demo video + excellent README + reproducibility
Agent-to-human or agent economies
Build useful personal agents, document assistants, health tools, etc.
Build in Public + social proof
Share progress on X/Discord (Build in Public bonus)

Recommended Strategy for QVAC:Choose a track that matches your hardware strength.
Go deep with QVAC features (especially RAG + P2P delegation + multimodal).
Add an "agent reasoning" layer (explain decisions like Auric does).
Provide strong evidence bundle (inference logs, TTFT, tokens/sec, hardware proof).
Make it useful for real people (personal knowledge base, health assistant, offline productivity, etc.).

Final Summary & Actionable AdviceAuric is the perfect blueprint of a winning Tether project:Solves a real problem
Uses their tech deeply and correctly
Delivers autonomy + transparency
Has beautiful UX and demo
Shows clear on-chain results

The same principles will win the QVAC Edge AI hackathon.Next Steps I Recommend:Study Auric’s GitHub + video in detail (already done above).
Pick one strong idea that uses QVAC SDK heavily.
Focus on evidence + demo quality as much as the idea itself.
Build in public on X and Discord.
Join the QVAC Discord immediately.

Would you like me to:Create a project idea generator tailored for QVAC based on these patterns?
Analyze another specific winning project in the same depth as Auric?
Help you outline a winning submission structure for the current QVAC hackathon?

Just say the word and I’ll deliver it immediately. You now have everything needed to win. Good luck! 

RULES AND HACKATHON 
https://dorahacks.io/hackathon/qvac-unleach-edge-ai-i/tracks 
QVAC Hackathon I – Unleash Edge AI
Welcome to the first official QVAC Hackathon, a month long event running between June 1 and June 21, 2026 organised by the QVAC team at Tether to prove that local-first, privacy-preserving, decentralised AI is production-ready today.

What's it about?
Using the QVAC SDK (our single cross-platform JS API for on-device inference, RAG, P2P model sharing, delegated compute, fine-tuning and multimodal capabilities) you will build real applications that run entirely on consumer hardware (phones, laptops, SBCs) with zero cloud dependencies.

This hackathon is not another generic AI event. Where looking for public demonstrations - by the community (i.e. you) - that edge AI powered by QVAC can deliver privacy, speed, resilience, and cost savings that to outmatch centralised providers.

Why should I join?
A chance to win a significant USDT prize on the podium
A special "Build in Public!" category with its own USDT prize for the winning team
There are four awesome tracks that you can win even if you don't reach the global podium. Each track has its own USDT prize for the primary winner and a possible secondary one for an honourable mention.
A nice opportunity to build something you can actually ship and own with no vendor lock-in and no API bills
Direct exposure to the QVAC by Tether team and potential partnerships
A great opportunity to contribute towards the open local-AI ecosystem
Build in Public!
We want to encourage builders who make it public!

Follow QVAC on X and check all the information here!

What are the constraints?
This is a BYOH (Bring Your Own Hardware) event, whatever you have available will do: flagship phone, high-end workstation, Raspberry Pi or anything in between. Since you can't bring your datacenter with you, performing inference on a cluster (even if it's your own private cloud) is not allowed.

The only non-negotiables are:

All inference must use the QVAC SDK (@qvac/sdk)
Join our Discord community
Projects must be fully open-source (MIT / Apache 2.0) with clear README + reproducibility instructions
Submissions must include the full evidence bundle for our 3-stage verification process (more info here)
Timeline
Registration opens: May 25, 2026

Build period: June 1 - June 21, 2026

Winner Announcement: July 3

Support and Community
Join our Discord community

Full QVAC SDK documentation and Pre-built examples can be found here
Our models can be found on Hugging Face
We'll be releasing examples of repos soon
Let’s build the new age of local AI — together
Here you can find the Terms of Participation and Privacy Policy
General Purpose devices
Devices: Dedicated hardware up to 32 GB RAM (laptops, desktops, workstations, high-end mini-PCs, etc.).

How is this measured? If you have multiple devices performing inference in your project (e.g. a laptop and a mobile phone) the one with the most capacity of the two will be considered the main.

What kind of projects belong in this track? Any ambitious, production-grade application that leverages the full power of consumer-grade but capable hardware. Projects should push the boundaries of what retail-level devices can achieve with the QVAC SDK.

Focus areas & technologies:

Complex multi-agent systems with orchestration and tool calling
Multimodal applications (vision + text + audio)
Advanced RAG pipelines with large document collections
Real-time applications that combine local inference with P2P delegation
Fine-tuning / LoRA adaptation using QVAC Fabric on consumer GPUs
Privacy-first enterprise tools (local document intelligence, customer support agents, personal knowledge bases, etc.)
Tinkerer
Devices: Single-board computers (Raspberry Pi 4/5, Orange Pi, Rock Pi, etc.) with ≤ 4 GB RAM (or equivalent low-power edge devices)

What kind of projects belong in this track? Clever, highly optimised solutions that run efficient (but meaningful) task-centric AI tasks on extremely constrained hardware. Think of this as the “maximum impact with minimum resources” track.

Focus areas & technologies:

Ultra-lightweight model combinations
Creative use of QVAC’s P2P delegation (phone → SBC → desktop meshes)
Offline-first IoT / robotics / monitoring agents
Battery-powered or solar-powered AI nodes
Edge sensor fusion + local inference (computer vision on Pi, voice assistants, environmental monitors, etc.)
Novel ways to make small models (1B–3B) useful through clever prompting, RAG, or tool use
Goals & inspiration: Prove that local AI is accessible to everyone — even on a $50–$150 device. We want to see ingenuity, optimization tricks, and “wow, it actually runs on that?!” moments.

Mobile
Devices: Retail smartphones and tablets only (Android or iOS). No custom/industrial/embedded boards.

What kind of projects belong in this track? Fully on-device mobile applications that deliver delightful, private AI experiences directly in the user’s pocket.

Focus areas & technologies:

Personal AI assistants that work completely offline
Health/wellness apps using on-device MedPsy or other models
Multimodal mobile experiences (photo → analysis, voice → action)
Privacy-first alternatives to cloud apps (local note summarization, travel assistants, language translators, personal tutors, etc.)
Creative use of QVAC SDK + mobile-specific features (camera, microphone, sensors)
Delegation scenarios where the phone offloads heavy tasks to a laptop/desktop via P2P
Goals & inspiration: Show that flagship (and even mid-range) phones can deliver production-quality AI without sending any data to the cloud. Bonus points for beautiful UX and real daily-life utility.

Our Psy models
Devices: Any form factor (General Purpose, Tinkerer, or Mobile) the track is open across hardware classes.

What kind of projects belong in this track? Any project that meaningfully uses QVAC models locally.

Example: use MedPsy to solve use cases in healthcare, wellness, or clinical-adjacent problems:

Private on-device health assistants
Medical document analysis / RAG over personal health records
Symptom checkers or patient-education tools
Integration with wearables for local trend analysis
Clinical decision support aids for professionals (research/education use only)
Creative combinations with other QVAC modalities (voice, vision, etc.)
Goals & inspiration: Highlight the unique value of MedPsy’s strong reasoning capabilities at small sizes. Demonstrate that high-quality medical intelligence can run privately on user devices.

Note: Tools operating in the medical space may be subject to laws, licensing requirements and risks. We cannot and will not be assessing whether a tool built using QVAC MedPsy is compliant with or subject to any laws or licensing requirements or effectively addresses applicable risks. Nothing associated with this Hackathon, including selection for a prize, should be construed as legal, licensing or other advice. Teams looking to commercialize what they build must do their own diligence to determine their own compliance with laws and licensing requirements as well as how to address risks associated with their projects.
How to participate
Rules
These Rules and your participation in the Hackathon are subject to the Terms of  Participation and Privacy Policy. Anyone can sign up as a participant in the QVAC Hackathon: Unleash Edge AI (the “Hackathon”), as long as you meet the Eligibility Requirements described in the Terms of Participation. 
You are allowed to submit a single entry. You may participate individually or within a team of up to four participants, but you may not participate both individually and within a team and you may not participate as a member of multiple teams. If you are participating as a part of a team, please ensure that the project page on DoraHacks clearly lists you as a member of that team. See the “Signing up” section below for more information.
This Hackathon is about demonstrating production-grade local/on-device AI solutions by leveraging the QVAC SDK (https://qvac.tether.io): Tether’s on-device AI inference software development kit (“QVAC”). Therefore a fundamental requirement is to use the QVAC SDK for all inference, embeddings, RAG, multimodal, TTS/STT, and any related workloads. You may additionally use QVAC Fabric for fine-tuning, Genesis datasets and MedPsy models. Cloud APIs are not allowed except for clearly disclosed optional non-AI services. Leveraging multi-GPU inference clusters to achieve better performance during the hackathon is also not allowed.
You must ensure that your project is hosted on a GitHub repository that is accessible to us. In addition, given the purpose of this Hackathon is to showcase and encourage adoption of QVAC you must also make it available publicly under the Apache 2.0 license during the Hackathon and for a reasonable period of time afterwards.
You are required to include a video of your project as part of your submission. Please upload the video to YouTube as “unlisted” and share a link to it in the submission form. 
Your project must be straightforward for judges to evaluate: provide clear setup instructions, be runnable “out of the box” on the declared hardware and include all required submission artifacts. See the section “Submitting a Project” for more information.
You may use any programming language and framework, as long as: 
The QVAC SDK is integrated in a meaningful way in order to handle all the relevant workloads (example: completion, embeddings/RAG, multimodal, tool calling, P2P/delegated inference, etc.).  
The submission must include clear instructions to run or test the project. 
All third-party services, APIs, or pre-built components must be disclosed.
 

The deadline to submit your project is June 21, 2026 at 23:59 UTC (end of the DoraHacks Build Period). Submissions are handled via DoraHacks, for more information see the section “Submitting a Project” for more information.
Signing up
To participate, you will register through DoraHacks at https://dorahacks.io. Your use of DoraHacks will be subject to the Terms of Use Agreement for DoraHacks (https://dorahacks.io/legal/terms) and the DoraHacks Privacy Policy (https://dorahacks.io/legal/privacy). DoraHacks is a third-party platform and it is not under the control of Tether or its affiliates. Tether and its affiliates make no representations about and accept no liability for DoraHacks. Further, Tether and its affiliates do not (i) owe you any duty of care with respect to DoraHacks, and (ii) are not responsible for the accuracy or reliability of DoraHacks, except to the extent Tether loaded such information into DoraHacks with respect to such information.
Whether you are participating solo or as a team, the project must be created on DoraHacks, and all team members must be added to the project page to be eligible. 
By choosing to sign-up you are agreeing to these Rules and the Terms of Participation and accepting that you have read and understood them.
Submitting a project
Given that local AI is a hardware constrained problem, in order to accept a submission we need  to ensure that:

we enable a transparent local-inference validation by the evaluation panel
we level the playing field for all submissions to showcase developer excellence and not just access to high quality hardware
Therefore you need to provide specific information about several topics:

Product Name and Description
Your Team's hashtag (in case you're Building In Public on X/Youtube)
A list of teammates, with context on your background and previous experiences
Where the team is located
Which track(s) you’re participating on:
General Purpose: retail devices up to 32 GB RAM
Tinkerer: Single-board computers / low-power devices (e.g., Raspberry Pi ≤ 4 GB RAM).  
Mobile: Retail smartphones (Android/iOS) only — no custom/industrial hardware.  
Psy Models: Projects making strong use of QVAC MedPsy (or other QVAC models and datasets) for specialized tasks (health, STEM, etc.).
Public Github repo link(s)
Prior Work must be clearly disclosed in the submission (including use of pre-existing code by you or your team). You or your team may begin development before the Hackathon, however for fairness the judging will focus exclusively on work completed during the Hackathon period
Reproducibility instructions including hardware specs for all devices used (CPU, GPU, RAM, storage) in the demo (including screenshots of the system profiler)
Your repository must have a file in a structured format (json, xml, yaml, ...) listing every remote API call your project uses (if any) for transparency, e.g. if you connect to a cloud document provider you should disclose you use that API.
A Demo video showing the app running and showcasing your results. All presentations must be submitted as a video presentation. Videos should be  no longer than 5 minutes and be accompanied by:
An auditable log in a structured format (csv, json, ...) capturing at least: model loads/unloads and inference call performance (prompt, tokens, TTFT, tokens/sec) for a standard demo run
You should allocate enough time to ensure your presentation video and artifacts are clear, concise and high quality.

Validation and Winner Selection
The validation process runs on three stages and is built around an evidence framework that is designed to evaluate transparency and honesty:

Stage 1: We run a static analysis of the repository
Stage 2: We run an artifact & artifact consistency review
Stage 3: Is a potential live action to be defined, per project, by the evaluation team.
Projects are evaluated both for the Global Podium (1st to 3rd place) as well as each track that they participate on.

Evaluations are holistic with emphasis on real local/on-device performance, creativity, real-work relevance and production-grade architecture. Polish is appreciated, but strong technical decisions and impressive results matter more for the evaluation than UI or UX.

Your project will be evaluated based on the following criteria, of which some are subjective and others objective:

Technical execution & Performance: Quality, optimization, TTFT/TPS on target hardware, P2P/delegated inference.  
Innovation & Model creativity: Creative combination of models pushing boundaries of edge AI.  
QVAC usage: Strong use of all of the QVAC (Tether Data’s AI) stack (models, datasets, fine-tuning, integrations with our apps, etc.)
Artifact quality & Verification: Consistency of logs, video, and hardware claims.  
Impact & Market relevance: Practical use cases applicable to real businesses/products.
Originality: Novel edge/P2P applications, UX, security (prompt injection resistance).  
Awareness: Projects which help share the word about the hackathon according to the guidelines of social posting.
Early bird: Bonus for complete submissions before June 17.
There is a social vote as well from the community on Discord and Keet that will be considered as a factor.

No Endorsement; Compliance is Your Obligation
This hackathon is for demonstration and innovation purposes.

We may reach out to participants to generate marketing material or award a prize. Nothing associated with this Hackathon, including selection for a prize, should be construed as legal, licensing or other advice or an endorsement by Tether. Teams looking to commercialize what they build must do their own diligence to determine their own compliance with laws and licensing requirements as well as how to address risks associated with their projects.