// lazy-prep.js

/**
 * Core function to create the next Lazy Session.
 * You can expand this to generate journal entries, folders, etc.
 */
async function createNextLazySession() {
  // Example behavior: create a journal entry
  const journalName = "Lazy Session Prep";
  const existing = game.journal.find(j => j.name === journalName);

  if (!existing) {
    await JournalEntry.create({
      name: journalName,
      content: "<h1>Step 1: Review the last session</h1><p>...</p>",
      folder: null,
      flags: { "lazy-prep": { generated: true } }
    });
    ui.notifications.info(`Journal entry '${journalName}' created.`);
  } else {
    ui.notifications.warn(`Journal entry '${journalName}' already exists.`);
  }
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
});
