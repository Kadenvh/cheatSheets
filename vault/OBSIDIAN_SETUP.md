# Obsidian Setup (CheatSheets Vault)

## Vault
- Open folder: `/home/ava/cheatSheets/vault/`
- Concepts live in: `Concepts/`
- New notes default to: `Concepts/`

## Required plugin
- Community plugin: `dataview`

## Current core app config
- `alwaysUpdateLinks: true`
- `newFileLocation: folder`
- `newFileFolderPath: Concepts`
- `attachmentFolderPath: attachments`
- `showLineNumber: true`

## Graph view profile
- Orphans visible (`showOrphans: true`)
- Unresolved links visible (`hideUnresolved: false`)
- Color groups configured for Concepts path + key tags (#python, #statistics, #docker/#containers, #javascript/#typescript, #css/#html, #linux/#bash, #sql/#databases)

## Daily workflow
1. Author/update concepts in `Concepts/*.md`
2. Use `[[wiki-links]]` for prerequisites
3. Trigger sync: `POST /api/learning/vault-sync`
4. Verify in app: CheatSheets > Health/Learn

## Notes
- Dataview is optional for querying; learning pipeline does not depend on Dataview execution.
- Keep filename slugs stable when possible; they are concept IDs.
