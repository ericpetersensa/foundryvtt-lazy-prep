async function createNextLazySession() {
  const folderName = "Session Prep";

  // Find or create the folder
  let folder = game.folders.find(f => f.name === folderName && f.type === "JournalEntry");
  if (!folder) {
    folder = await Folder.create({
      name: folderName,
      type: "JournalEntry",
      parent: null,
      color: "#C4C3D0"
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

  ui.notifications.info(`Created '${sessionName}' with Lazy DM pages.`);
}
