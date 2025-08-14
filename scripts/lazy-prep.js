// lazy-prep.js

/**
 * Generate a rich summary for a player-owned actor.
 */
function generateActorSummary(actor) {
  const level = actor.system?.details?.level ?? "—";
  const hp = actor.system?.attributes?.hp;
  const ac = actor.system?.attributes?.ac?.value ?? "—";
  const pp = actor.system?.skills?.prc?.passive ?? "—";

  const classItem = actor.items.find(i => i.type === "class");
  const className = classItem?.name ?? "—";
  const subclass = classItem?.system?.subclass ?? "";

  const backgroundItem = actor.items.find(i => i.type === "background");
  const background = backgroundItem?.name ?? "—";

  const skills = Object.entries(actor.system?.skills ?? {})
    .filter(([_, data]) => data.proficient > 0)
    .map(([key]) => key.toUpperCase())
    .join(", ") || "None";

  const languages = actor.system?.traits?.languages?.value?.join(", ") || "None";

  const spotlight = actor.flags["lazy-prep"]?.lastSpotlight ?? "—";
  const lastSeen = actor.flags["lazy-prep"]?.lastSeen ?? "—";

  return `
    <h3>${actor.name}</h3>
    <ul>
      <li><strong>Class:</strong> ${className}${subclass ? ` (${subclass})` : ""}</li>
      <li><strong>Level:</strong> ${level}</li>
      <li><strong>HP:</strong> ${hp?.value ?? "—"} / ${hp?.max ?? "—"}</li>
      <li><strong>AC:</strong> ${ac}</li>
      <li><strong>PP:</strong> ${pp}</li>
      <li><strong>Skills:</strong> ${skills}</li>
      <li><strong>Languages:</strong> ${languages}</li>
      <li><strong>Background:</strong> ${background}</li>
      <li><strong>Last Spotlight:</strong> ${spotlight}</li>
      <li><strong>Last Seen:</strong> ${lastSeen}</li>
    </ul>
    <hr>
  `;
}

/**
 * Create the next Lazy DM session journal with 8 prep pages.
 */
async function createNextLazySession() {
  const folderName = "Session Prep";
  const folderColor = "#C4C3D0";

  let folder = game.folders.find(f => f.name === folderName && f.type === "JournalEntry");
  if (!folder) {
    folder = await Folder.create({
      name: folderName,
      type: "JournalEntry",
      parent: null,
      color: folderColor
    });
  }

  const sessionJournals = game.journal.filter(j =>
    j.folder?.id === folder.id && /^Session \d+$/.test(j.name)
  );

  const sessionNumbers = sessionJournals.map(j =>
    parseInt(j.name.replace("Session ", ""), 10)
  );

  const nextSessionNumber = sessionNumbers.length
    ? Math.max(...sessionNumbers) + 1
    : 0;

  const sessionName = `Session ${nextSessionNumber}`;

  const journal = await JournalEntry.create({
    name: sessionName,
    folder: folder.id,
    content: `<p>This journal contains prep pages for ${sessionName}.</p>`
  });

  const lazySteps = [
    "Review the Characters",
    "Create a Strong Start",
    "Outline Potential Scenes",
    "Define Secrets and Clues",
    "Develop Fantastic Locations",
    "Outline Important NPCs",
    "Choose Relevant Monsters",
    "Select Magic Items"
  ];

  const playerActors = game.actors.filter(actor => actor.hasPlayerOwner);
  const actorSummaries = playerActors.map(generateActorSummary).join("");

  const pages = lazySteps.map(step => {
    const isCharacterPage = step === "Review the Characters";
    const content = isCharacterPage
      ? `<h2>${step}</h2><p>This page summarizes key details for each player character.</p>${actorSummaries}`
      : `<h2>${step}</h2><p>Use this space to plan your '${step.toLowerCase()}' step.</p>`;

    return {
      name: step,
      type: "text",
      text: {
        format: 1,
        content
      }
    };
  });

  await journal.createEmbeddedDocuments("JournalEntryPage", pages);

  ui.notifications.info(`✅ Created '${sessionName}' with Lazy DM pages.`);
}

/**
 * Automatically creates a macro for the Lazy Prep workflow.
 */
async function createLazyPrepMacro() {
  const macroName = "Create Next Lazy Session";

  let macro = game.macros.find(m => m.name === macroName);
  if (!macro) {
    macro = await Macro.create({
      name: macroName,
      type: "script",
      scope: "global",
      command: createNextLazySession.toString() + "\ncreateNextLazySession();",
      img: "icons/skills/social/diplomacy-handshake.webp",
      flags: { "lazy-prep": { autoCreated: true } }
    });

    ui.notifications.info(`Macro '${macroName}' created. Drag it to your hotbar!`);
  }
}

/**
 * Hook that runs when Foundry is ready.
 */
Hooks.once("ready", async () => {
  console.log("Lazy Prep module loaded.");
  await createLazyPrepMacro();

  const sessionZero = game.journal.find(j => j.name === "Session 0");
  if (!sessionZero) {
    await createNextLazySession(); // Will create Session 0 first
  }
});
