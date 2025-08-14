Hooks.once("ready", () => {
  const journalName = "Session Prep";

  if (!game.journal.getName(journalName)) {
    JournalEntry.create({
      name: journalName,
      content: "<h1>Lazy Prep</h1><p>Start prepping your session here!</p>"
    });
    ui.notifications.info(`Created '${journalName}' journal entry.`);
  } else {
    ui.notifications.info(`'${journalName}' already exists.`);
  }
});
