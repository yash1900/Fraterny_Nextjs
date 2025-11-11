// Archetype data structure

export interface Context {
  self: string;
  world: string;
  aspire: string;
}

export interface Archetype {
  name: string;
  contexts: Context;
}

export interface Cluster {
  name: string;
  img: string,
  blurb: string;
  archetypes: Archetype[];
}

export const clusterBlurbs = {
  strategists: "You like things that make sense. You compare options, pick the one that actually helps, and keep going. Around you, people feel calmer because there's a path instead of noise. At your best you're clear and steady; on tough days you can get a bit rigid—pausing to check in with people softens the edges.",
  
  hiddenThinkers: "You think before you speak and prefer to get it right. Evidence and craft matter to you, even if it means moving slower. People experience you as thoughtful and grounded. Your gift is depth; your watch-out is hiding too long—sharing a little earlier lets others meet you halfway.",
  
  freeSpirits: "You move when something feels alive. You try things, remix them your way, and bring lightness when the mood is heavy. Folks around you remember that life can be playful and still meaningful. Finishing small pieces and checking your timing keeps your spark from scattering.",
  
  restlessMinds: "Your head holds ten ideas at once. That can be exciting—or exhausting. What helps is shrinking the next step, closing a few tabs (literal or mental), and doing one gentle thing now. Your talent is turning \"too much\" into motion; just remember to choose before you collect more.",
  
  healingHearts: "You make rooms feel safer. You listen well, name what's real, and use small rituals—water, sunlight, a text—to bring people back to center. Clear boundaries protect your care so it lasts. Hope with edges is your superpower.",
  
  soulAligned: "You sense what a space needs and help it land. You can name feelings without blame, invite honesty, and line up actions with values. Being around you often feels like an exhale, then a gentle nudge forward. Just watch that tuning the vibe doesn't replace making the move.",
  
  steadycore: "You're balanced by default. Not too loud, not too still—just dependable. Single steps, quiet focus, slow and true progress. When life gets blurry, you return to simple: one task, one breath, one honest choice."
};

export const clusters: Cluster[] = [
  {
    name: "The Strategists",
    img: '/9.png',
    blurb: "You like things that make sense. You compare options, pick the one that actually helps, and keep going. Around you, people feel calmer because there's a path instead of noise. At your best you're clear and steady; on tough days you can get a bit rigid—pausing to check in with people softens the edges.",
    archetypes: [
      {
        name: "Min-Maxer",
        contexts: {
          self: "You see yourself as someone who trims the extra and keeps what actually helps. You make little systems that save time, cut noise, and give you more from the same effort. It feels good when life is efficient and clear.",
          world: "People tend to see you as the \"cut-to-the-point\" friend. You're the one who spots the small change that makes a big difference and gently drops what isn't working. To others, you look practical, tidy, and surprisingly calm.",
          aspire: "You want to become someone who spends energy where it actually counts. Fewer moving parts, more steady gains. You're aiming for simple habits that compound—without squeezing out joy or curiosity."
        }
      },
      {
        name: "Speedrunner",
        contexts: {
          self: "You see yourself as someone who moves in quick, focused bursts. Getting a first version out helps you think; you'd rather try today and polish after than sit on it and stall.",
          world: "People often describe you as \"gets things going.\" You look fast, light on your feet, and good at breaking a big task into a small start. Sometimes others read you as scrappy; mostly they're relieved something finally moved.",
          aspire: "You want to be quick without running yourself ragged—ship a clean slice, keep two simple checks, and leave space to breathe. The goal is speed that feels healthy and kind."
        }
      },
      {
        name: "Meta Reader",
        contexts: {
          self: "You see patterns early. You notice where things are heading and prefer small, thoughtful bets when the timing feels right. You like having a quiet \"why now\" behind your choices.",
          world: "Others experience you as the person who spots the turn before the crowd. You bring new angles without the hype, and you're good at choosing moments that land.",
          aspire: "You want to trust your sense of timing and pair it with gentle proof—tiny pilots, clear exit signs, and the nerve to move when the window opens."
        }
      },
      {
        name: "Build Master",
        contexts: {
          self: "You think better when the base is solid. Messy foundations make you itch; you'd rather fix the core so everything else becomes easier and calmer.",
          world: "People often see you as steady and careful in a comforting way. You set simple standards, clean up the wobbly bits, and make things feel reliable.",
          aspire: "You want strength without stiffness—build what lasts, then call it \"good enough\" sooner so life keeps flowing."
        }
      },
      {
        name: "Clutch Caller",
        contexts: {
          self: "Under pressure, you get clearer. You gather what's true, name the options, and choose a path you can stand by. You don't disappear when it's tense.",
          world: "Others feel steadier around you when things heat up. You make the call, assign next steps, and keep your word. People read you as calm and responsible.",
          aspire: "You want fewer fire drills and more prepared calm—listening wider before the heat rises and sharing the load so the decision isn't always yours alone."
        }
      },
      {
        name: "Rogue Operator",
        contexts: {
          self: "You see yourself as someone who protects the outcome, even when it's uncomfortable. If something drags the whole thing down, you'd rather name it and change it.",
          world: "People tend to see you as direct—sometimes blunt—but fair. You'll cut what's not working and move energy to what is, and you usually explain the \"why.\"",
          aspire: "You want courage with care: make the tough cut, say it gently, and keep a couple of key people with you when you do."
        }
      }
    ]
  },
  {
    name: "The Hidden Thinkers",
    img: '/10.png',
    blurb: "You think before you speak and prefer to get it right. Evidence and craft matter to you, even if it means moving slower. People experience you as thoughtful and grounded. Your gift is depth; your watch-out is hiding too long—sharing a little earlier lets others meet you halfway.",
    archetypes: [
      {
        name: "Quiet Prodigy",
        contexts: {
          self: "You trust the work more than the noise. You take time to get it right, let the craft speak first, and feel most like yourself when quality is doing the talking.",
          world: "People often see you as steady and exact. You don't chase attention—you bring finished, thoughtful things that raise the bar without a speech.",
          aspire: "You want the kind of quiet excellence that lasts—ship when it's solid, share a little sooner than usual, and let results carry the story."
        }
      },
      {
        name: "Proof Seeker",
        contexts: {
          self: "You feel safer when the steps are clear. You like defining \"what good looks like,\" running a small test, and deciding based on what actually happened.",
          world: "Others experience you as fair and practical. You're the person who asks the simple, grounding question—\"How will we know?\"—and then follows the answer.",
          aspire: "You want clean proof without getting stuck. A small pilot, honest criteria, and the courage to move when the signal is good enough."
        }
      },
      {
        name: "Calibrator",
        contexts: {
          self: "You're at ease tuning what's already live. You make one change, check the result, and keep nudging until things work smoothly in the real world.",
          world: "People see you as the quiet fixer. You lower the noise, adjust the right knobs, and help systems feel reliable again.",
          aspire: "You want to keep your gentle touch and add timing—one focused tweak, a clear rollback if needed, and space to step back when a bigger rebuild is due."
        }
      },
      {
        name: "Draft Mode",
        contexts: {
          self: "You like to polish before the eyes arrive. You take pride in first impressions that feel complete, even if it means a little more time alone with the work.",
          world: "Others see you as careful in a comforting way. When you show something, it's coherent, considered, and easy to trust.",
          aspire: "You want polish that doesn't trap you. Share an early slice with two trusted people, set a limit on tweaking, and let the world help finish the shine."
        }
      },
      {
        name: "Threshold Walker",
        contexts: {
          self: "You often stand at 90%, waiting for a small nudge or the first two steps to be clear. Once you start, you follow through well.",
          world: "People experience you as dependable with structure. Give you a checklist or a gentle \"start here,\" and you cross the line and keep going.",
          aspire: "You want to begin with ease. Ask for the smallest next step, set a short timer, and let momentum do the rest."
        }
      }
    ]
  },
  {
    name: "The Free Spirits",
    img: '/8.png',
    blurb: "You move when something feels alive. You try things, remix them your way, and bring lightness when the mood is heavy. Folks around you remember that life can be playful and still meaningful. Finishing small pieces and checking your timing keeps your spark from scattering.",
    archetypes: [
      {
        name: "Wildcard",
        contexts: {
          self: "You jump in when something feels alive. You like trying first and learning by doing, even if the plan is thin. Starting gives you energy.",
          world: "People see you as spontaneous in a good way—the one who says \"I'll go first.\" You bring spark and momentum, though sometimes you leave a few loose ends.",
          aspire: "You want to keep the spark and finish more. A tiny \"wrap-up hour,\" one safety check, and one thing closed each day—so your jumps land."
        }
      },
      {
        name: "Vibe Pilot",
        contexts: {
          self: "You move by timing. You watch energy—yours and the room's—and act when it feels right. Shifting the \"when\" often fixes the \"how.\"",
          world: "Others experience you as smooth and well-timed. You pick moments that land, avoid forcing things, and help plans glide instead of grind.",
          aspire: "You want to trust your sense of timing without waiting forever. Two simple rules—\"good enough to start\" and a 24-hour window to act—keep you from over-pausing."
        }
      },
      {
        name: "SideQuester",
        contexts: {
          self: "Curiosity pulls you into side paths. You follow rabbit holes and often find something useful no one else noticed. Detours are how you learn.",
          world: "People see you as the one who uncovers hidden links and interesting options. At times you can look scattered before the thread comes together.",
          aspire: "You want your detours to add up. Pick one path to finish each week, park the rest, and show the one thing your curiosity built."
        }
      },
      {
        name: "Glitchjoy",
        contexts: {
          self: "When things go sideways, you turn the moment into a story and keep moving. Humor helps you shake off the sting and try again.",
          world: "Others feel lighter around you. You defuse tension, make room for a reset, and help people take the next step instead of getting stuck.",
          aspire: "You want your jokes to heal, not hide. Name the feeling first, then smile and move—honesty + humor so progress sticks."
        }
      },
      {
        name: "Offscript",
        contexts: {
          self: "You don't love copy-paste life. You make things your way so they feel true, even if it means ignoring the usual template.",
          world: "People see you as original—someone who brings a fresh angle and isn't afraid to stand out. Sometimes they're unsure where you'll take it next.",
          aspire: "You want freedom with a through-line. Choose one clear constraint (timebox, theme, or finish rule) so your style lands and lasts."
        }
      }
    ]
  },
  {
    name: "The Restless Minds",
    img: '/7.png',
    blurb: "Your head holds ten ideas at once. That can be exciting—or exhausting. What helps is shrinking the next step, closing a few tabs (literal or mental), and doing one gentle thing now. Your talent is turning \"too much\" into motion; just remember to choose before you collect more.",
    archetypes: [
      {
        name: "Loopbreak",
        contexts: {
          self: "Your thoughts can replay the same scene, and you know it. What helps is a tiny action—one text, one line, one two-minute start—that cuts a new path and lets the mind breathe.",
          world: "People see you notice patterns and name when you're stuck. They often watch you take one small, visible step that shifts the mood from \"spinning\" to \"moving.\"",
          aspire: "You want a simple break-the-loop kit: a timer, a two-minute rule, and one friend you can ping. Not perfect—just enough to change the channel."
        }
      },
      {
        name: "Tab Overload",
        contexts: {
          self: "You collect articles, ideas, and plans \"for later\" until it all feels heavy. You care deeply; it just piles up. Closing a few tabs—digital or mental—gives you air.",
          world: "Others see you as curious and well-read, with lots of options on hand. Sometimes they also see the weight of too many open threads.",
          aspire: "You want to keep the curiosity and lose the clutter: pick three keepers, archive the rest, and move one thing forward today."
        }
      },
      {
        name: "What-If Tamer",
        contexts: {
          self: "Your mind runs scenarios to feel safe. You map best / worst / likely, and it calms you to know the plan. When you write it down, fear gets edges.",
          world: "People experience you as thoughtful and prepared. You're the one who says, \"If this, then we do that,\" and the room relaxes a little.",
          aspire: "You want planning that leads to action: one page, three scenarios, one chosen next step. Enough structure to soothe, enough movement to live."
        }
      },
      {
        name: "Soft Focus",
        contexts: {
          self: "You work best when pressure is gentle. Single-tasking with a calm pace helps you finish more than any harsh push ever did.",
          world: "Others see you as steady when the rush fades. You move quietly, keep attention on one thing, and bring a kinder rhythm to the day.",
          aspire: "You want a routine that protects your calm: soft start, phone out of reach, one clear finish line. Slow is smooth; smooth gets it done."
        }
      },
      {
        name: "Signal Finder",
        contexts: {
          self: "You like trimming noise until the important part shows. Fewer inputs, clearer choices, cleaner days—that's when you feel sharp.",
          world: "People notice you cut to the point without being cruel. You make lists shorter, choices simpler, and next steps obvious.",
          aspire: "You want curation you can live with: limit the feeds, set \"top-3 only,\" and make space for silence so real signals stand out."
        }
      }
    ]
  },
  {
    name: "The Healing Hearts",
    img: '/11.png',
    blurb: "You make rooms feel safer. You listen well, name what's real, and use small rituals—water, sunlight, a text—to bring people back to center. Clear boundaries protect your care so it lasts. Hope with edges is your superpower.",
    archetypes: [
      {
        name: "Lightkeeper",
        contexts: {
          self: "You hold a small lamp for yourself and others. When things feel heavy, you look for one honest bright spot and build from there—gratitude, a short walk, a message that says \"I'm here.\"",
          world: "People experience you as quietly uplifting. You don't deny what's hard; you name it—and then point to something workable. Your steadiness helps others breathe.",
          aspire: "You want hope that isn't hollow: a few daily rituals that restore you, words that tell the truth, and the courage to keep a tiny flame going when days are dim."
        }
      },
      {
        name: "Embercarrier",
        contexts: {
          self: "Your warmth is soft and close. You listen fully, offer a calm presence, and keep a gentle ember alive even when the room goes cold.",
          world: "Others feel safe opening up around you. You don't rush fixes—you make space, reflect feelings back cleanly, and let people find their footing.",
          aspire: "You want to protect your warmth so it lasts: clearer \"yes/no,\" a small refill ritual after deep talks, and trusted people who can hold you, too."
        }
      },
      {
        name: "Hopewright",
        contexts: {
          self: "You rebuild with small, repeatable habits. Checklists, tiny routines, and simple limits help you heal and make progress without drama.",
          world: "People see you as the practical encourager. You'll suggest one doable step, celebrate small wins, and keep pace kind but consistent.",
          aspire: "You want structure that's humane: pick one habit at a time, allow imperfect days, and let progress—not perfection—be the proof."
        }
      },
      {
        name: "Tender Shield",
        contexts: {
          self: "You care deeply and you set edges. Saying \"no\" kindly, asking for what you need, and choosing where your energy goes keeps your care real.",
          world: "Others read you as respectful and clear. You hold the line without blame and make relationships easier by being honest about limits.",
          aspire: "You want boundaries without guilt: simple language, early check-ins, and the reminder that protecting your capacity is also an act of love."
        }
      },
      {
        name: "Sunrise Club",
        contexts: {
          self: "Mornings change your day. Light, water, a stretch, a few minutes of stillness—small resets help you start again with a cleaner mind.",
          world: "People notice you bring gentle rhythm. You're not pushy; you simply invite a better pace, and the room softens into it.",
          aspire: "You want anchors that travel with you: a short morning sequence you can do anywhere, plus grace to begin again when the day starts messy."
        }
      }
    ]
  },
  {
    name: "The Soul-Aligned",
    img: '/12.png',
    blurb: "You sense what a space needs and help it land. You can name feelings without blame, invite honesty, and line up actions with values. Being around you often feels like an exhale, then a gentle nudge forward. Just watch that tuning the vibe doesn't replace making the move.",
    archetypes: [
      {
        name: "Threadweaver",
        contexts: {
          self: "You naturally see who belongs with whom. You make gentle introductions, connect dots across people and ideas, and enjoy watching a small link turn into something bigger.",
          world: "People know you as the connector. You remember names, notice fits, and say \"you two should meet\"—and somehow the room starts working together.",
          aspire: "You want to build circles that last: fewer scattered chats, more thoughtful matches, and quick follow-ups so good sparks become steady bridges."
        }
      },
      {
        name: "Quiet Beacon",
        contexts: {
          self: "You lower the volume without saying much. When tension rises, you slow the pace, hold steady eye contact, and help everyone breathe again.",
          world: "Others experience you as calm in the storm. You're not dramatic—you make space, soften edges, and invite people back to level ground.",
          aspire: "You want to keep your calm and add clarity: name what's true in plain words, ask one kind question, and guide the next small step."
        }
      },
      {
        name: "Heart Tuner",
        contexts: {
          self: "You can feel what's in the air and put words to it. Naming feelings and needs—yours and others'—helps you choose actions that actually fit.",
          world: "People feel seen around you. You reflect emotions cleanly, avoid blame, and help conversations shift from guessing to understanding.",
          aspire: "You want honesty that heals: name the feeling, name the need, suggest one workable request—simple language that opens doors, not wounds."
        }
      },
      {
        name: "Soul Cartographer",
        contexts: {
          self: "You map your inner world so it makes sense. Notes, sketches, or small journals help you trace patterns and choose the kinder road next time.",
          world: "Others see you as thoughtful and oriented. You can draw a quick map of what's going on, and suddenly the path forward looks clearer.",
          aspire: "You want maps that lead to movement: capture the pattern, circle one choice, and take a tiny step you can review tomorrow."
        }
      },
      {
        name: "Aura Editor",
        contexts: {
          self: "You shape spaces so people feel safe and present. A tidied corner, the right playlist, a softer light—small changes, big difference in how the moment flows.",
          world: "People notice they relax around you. You arrange the scene so focus comes easier and conversations feel kinder.",
          aspire: "You want atmosphere with a purpose: set the room, set the intention, then make the ask—vibe that supports action, not replaces it."
        }
      }
    ]
  }
];

export const steadycore = {
  name: "Steadycore",
  blurb: "You're balanced by default. Not too loud, not too still—just dependable. Single steps, quiet focus, slow and true progress. When life gets blurry, you return to simple: one task, one breath, one honest choice."
};