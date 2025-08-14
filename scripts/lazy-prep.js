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

  const pages = lazySteps.map(step => ({
    name: step,
    type: "text",
    text: {
      format: 1,
      content: `<h2>${step}</h2><p>Use this space to plan your '${step.toLowerCase()}' step.</p>`
    }
  }));

  const createdPages = await journal.createEmbeddedDocuments("JournalEntryPage", pages);

  // Now safely update the "Review the Characters" page
  const characterPage = createdPages.find(p => p.name === "Review the Characters");
  if (characterPage) {
    const playerActors = game.actors.filter(actor => actor.hasPlayerOwner);
    const actorSummaries = playerActors.map(actor => {
      const name = actor.name ?? "Unnamed";
      const level = actor.system?.details?.level ?? "—";
      const hp = actor.system?.attributes?.hp;
      const ac = actor.system?.attributes?.ac?.value ?? "—";
      return `
        <h3>${name}</h3>
        <ul>
          <li><strong>Level:</strong> ${level}</li>
          <li><strong>HP:</strong> ${hp?.value ?? "—"} / ${hp?.max ?? "—"}</li>
          <li><strong>AC:</strong> ${ac}</li>
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

  ui.notifications.info(`✅ Created '${sessionName}' with Lazy DM pages.`);
}
