// lazy-prep.js

/**
 * Create the next Lazy DM session journal with 8 prep pages.
 */
async function createNextLazySession() {
  const folderName = "Session Prep";
  const folderColor = "#C4C3D0";

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

  // Find existing session journals in the folder
  const sessionJournals = game.journal.filter(j =>
    j.folder?.id === folder.id && /^Session \d+$/.test(j.name)
  );

  // Extract session numbers
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

  // Add Lazy DM pages
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

  await journal.createEmbeddedDocuments("JournalEntryPage", pages);

  ui.notifications.info(`✅ Created '${sessionName}' with Lazy DM pages.`);
}

/**
 * Automatically creates a macro for the Lazy Prep workflow.
 */
async function createLazyPrepMacro() {
  const macroName = "Create Next Lazy Session";

  // Check if macro already exists
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

  // Create Session 0 on first load if it doesn't exist
  const sessionZero = game.journal.find(j => j.name === "Session 0");
  if (!sessionZero) {
    await createNextLazySession(); // Will create Session 0 first
  }
});
