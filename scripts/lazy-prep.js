// lazy-prep.js

/**
 * Create the next Lazy DM session journal with 8 prep pages.
 */
async function createNextLazySession() {
  const folderName = "Session Prep";
  const folderColor = "#7f7d99";

  // Find or create the folder
  let folder = game.folders.find(f => f.name === folderName && f.type === "JournalEntry");
  if (!folder) {
    folder = await Folder.create({
      name: folderName,
      type: "JournalEntry",
      parent: null,
      color: folderColor
    });
  }

  // Find existing session journals
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

  // Create journal entry
  const journal = await JournalEntry.create({
    name: sessionName,
    folder: folder.id,
    content: `<p>This journal contains prep pages for ${sessionName}.</p>`
  });

  // Create Lazy DM pages
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

  const pages = lazySteps.map(step => ({
    name: step,
    type: "text",
    text: {
      format: 1,
      content: `<h2>${step}</h2><p>Use this space to plan your '${step.toLowerCase()}' step.</p>`
    }
  }));

  const createdPages = await journal.createEmbeddedDocuments("JournalEntryPage", pages);

  // Safely enhance "Review the Characters" page
try {
  const characterPage = createdPages.find(p => p.name === "Review the Characters");
  if (characterPage) {
    const playerActors = game.actors.filter(actor => actor.hasPlayerOwner);
    const actorSummaries = playerActors.map(actor => {
      const level = actor.system?.details?.level ?? "—";
      const hp = actor.system?.attributes?.hp;
      const ac = actor.system?.attributes?.ac?.value ?? "—";
      const passive = actor.system?.skills?.prc?.passive ?? "—";

      const classItem = actor.items.find(i => i.type === "class");
      const className = classItem?.name ?? "—";

      const nameLine = `${actor.name ?? "Unnamed"} (Level ${level} ${className})`;

      return `
        <h3>${nameLine}</h3>
        <ul>
          <li><strong>HP:</strong> ${hp?.value ?? "—"} / ${hp?.max ?? "—"}</li>
          <li><strong>AC:</strong> ${ac}</li>
          <li><strong>PP:</strong> ${passive}</li>
        </ul>
        <hr>
      `;
    }).join("");

    const updatedContent = `
      <h2>Review the Characters</h2>
      <p>This page summarizes key details for each player character.</p>
      ${actorSummaries}
    `;

    await characterPage.update({ "text.content": updatedContent });
  }
} catch (err) {
  console.warn("⚠️ Failed to enhance 'Review the Characters' page:", err);
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
  console.log("🟡 Lazy Prep module initializing...");

  try {
    await createLazyPrepMacro();
    console.log("🟢 Macro creation succeeded.");

    const sessionZero = game.journal.find(j => j.name === "Session 0");
    if (!sessionZero) {
      console.log("🟡 Session 0 not found. Creating...");
      await createNextLazySession();
      console.log("🟢 Session 0 created.");
    } else {
      console.log("🟢 Session 0 already exists.");
    }
  } catch (err) {
    console.error("🔴 Lazy Prep initialization failed:", err);
  }
});
