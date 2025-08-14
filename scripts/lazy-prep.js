Hooks.once("ready", async () => {
  const folderName = "Session Prep";
  const journalName = "Session 0";

  let folder = game.folders.find(f => f.name === folderName && f.type === "JournalEntry");

  if (!folder) {
    folder = await Folder.create({
      name: folderName,
      type: "JournalEntry",
      parent: null,
      color: "#C4C3D0"
    });
    console.log(`Created folder: ${folderName}`);
  }

  let journal = game.journal.find(j => j.name === journalName);

  if (!journal) {
    journal = await JournalEntry.create({
      name: journalName,
      folder: folder.id,
      content: "<h1>Session 0 Prep</h1><p>Use this space to plan your first session.</p>"
    });
    console.log(`Created journal entry: ${journalName}`);
  }
});
