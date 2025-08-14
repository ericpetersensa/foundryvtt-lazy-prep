Hooks.once("ready", async () => {
  const folderName = "Session Prep";
  const journalName = "Session 0";

  // Check for existing folder
  let folder = game.folders.find(f => f.name === folderName && f.type === "JournalEntry");

  // Create folder if it doesn't exist
  if (!folder) {
    folder = await Folder.create({
      name: folderName,
      type: "JournalEntry",
      parent: null,
      color: "#FFD700", // Optional: golden accent
    });
    console.log(`Created folder: ${folderName}`);
  }

  // Check for existing journal entry
  let journal = game.journal.find(j => j.name === journalName);

  // Create journal entry if it doesn't exist
  if (!journal) {
    journal = await JournalEntry.create({
      name: journalName,
      folder: folder.id,
      content: "<h1>Session 0 Prep</h1><p>Use this space to plan your first session.</p>"
    });
    console.log(`Created journal entry: ${journalName}`);
  }
});
