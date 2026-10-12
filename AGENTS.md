# Repository Guidelines

## Project Structure & Module Organization

This checkout currently contains no source files, tests, or assets. As the project takes shape, keep application code in a clearly named source directory (such as `src/`), automated checks in `tests/` or alongside their modules, and static resources in `assets/`. Update this guide when the actual layout is established.

## Build, Test, and Development Commands

No build system or development scripts are configured yet. Once introduced, document the canonical commands here (for example, `npm run dev`, `npm test`, or `make build`) and state what each command does. Run the relevant checks before submitting changes.

## Coding Style & Naming Conventions

Follow the conventions of the language and framework selected for the project. Use consistent indentation, descriptive names, and small, focused modules. Add formatter and linter configuration with the first implementation, and run those tools before opening a pull request. Avoid introducing a second tool for the same job without a clear need.

## Testing Guidelines

There is no test framework or coverage requirement in this checkout. Add tests with new behavior and bug fixes, name test files consistently with the chosen framework, and document the command contributors should use to run the full suite.

## Commit & Pull Request Guidelines

Git history is unavailable in this checkout, so no established commit convention can be inferred. Use short, imperative commit subjects (for example, `Add dashboard filters`). Pull requests should explain the change and its motivation, list validation performed, and include screenshots for user-facing visual changes. Link related issues when applicable.

## Security & Configuration

Keep credentials and machine-specific settings out of version control. Provide safe example configuration (such as `.env.example`) if the project needs environment variables, and document required setup without including secrets.
