# Code Style

General code style and guidelines I use for my projects, can be copied into a
`CLAUDE.md`/`AGENTS.md` file for agents to follow.

## General Coding Preferences

- Apply the YAGNI and KISS principles
- Keep things simple, robust and readable
- Keep comments up to date with code changes

## Comments

- Inline Comments
  - Add inline comments for any non-obvious behavior
  - Inline comments should explain the _why_
  - Inline comments should be concise and useful (1-2 lines max)
- TSDoc Comments
  - Add a short tsdoc comment to exports describing intent and any non-obvious behaviour
  - Not required for every export, use judgment based on complexity
  - When you do add one, use the following format:
  ```ts
  /**
   * <short description>
   *
   * @param myParam - <short description>
   * ...
   *
   * @remarks
   * <optional: mention any behaviour that might trip up another developer>
   *
   * @example
   * \`\`\`ts
   * <example usage>
   * \`\`\`
   */
  ```
