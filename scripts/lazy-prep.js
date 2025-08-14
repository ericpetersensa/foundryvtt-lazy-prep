Hooks.once("ready", async () => {
  const folderName = "Session Prep";
  const journalName = "Session 0";

  // Create folder if needed
  let folder = game.folders.find(f => f.name === folderName && f.type === "JournalEntry");
  if (!folder) {
    folder = await Folder.create({
      name: folderName,
      type: "JournalEntry",
      parent: null,
      color: "#C4C3D0"  // Lavender Gray
    });
  }

  // Create journal entry if needed
  let journal = game.journal.find(j => j.name === journalName);
  if (!journal) {
    journal = await JournalEntry.create({
      name: journalName,
      folder: folder.id,
      content: "<p>This journal contains prep pages for Session 0.</p>"
    });

    // Create pages for each Lazy DM step
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

    for (const step of lazySteps) {
      await journal.createEmbeddedDocuments("JournalEntryPage", [{
        name: step,
        type: "text",
        text: {
          format: 1, // HTML
          content: `<h2>${step}</h2><p>Use this space to plan your '${step.toLowerCase()}' step.</p>`
        }
      }]);
    }

    console.log(`Created journal entry '${journalName}' with Lazy DM pages.`);
  }
});
