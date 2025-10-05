# Styleguide

This repository follows a consistent code style across JavaScript, TypeScript, CSS, and HTML files to maintain readability and uniformity. Formatting is managed by [Prettier](https://prettier.io/) using the settings in [.vscode/settings.json](../.vscode/settings.json).

To format code:

-   **VS Code:** Install the `esbenp.prettier-vscode` extension and run `Format Document` or enable format-on-save.
-   **CLI:** Run `npx prettier --write <files>`.

## JavaScript & TypeScript

-   **Indentation:** Tabs (width 4).
-   **Strings:** Use single quotes `'` for string literals.
-   **Semicolons:** Terminate all statements with semicolons.
-   **Naming:**
    -   Variables and functions use `camelCase` (`sketchFunction`).
    -   Classes and interfaces use `PascalCase` (`GUIControllerInterface`).
    -   Constants are written in `UPPER_SNAKE_CASE` (`LANG_SLEEP`).
-   **Type Annotations (TS):** Prefer explicit types for function arguments and return values.

## CSS

-   **Indentation:** Tabs (width 4).
-   **BEM Naming:** Use [BEM](http://getbem.com/) for class names: `block__element--modifier` (e.g., `.menu__item--active`).
-   **Custom Properties:** Use `kebab-case` for CSS variables (`--base-col`).

## HTML

-   **Indentation:** Tabs (width 4).
-   **Tags & Attributes:** Write tags and attribute names in lowercase.
-   **Attributes:** Wrap attribute values in double quotes.
-   **Classes:** Apply BEM classes defined in CSS (e.g., `class="menu__item"`).

Adhering to these rules helps ensure a uniform codebase that is easy to read and maintain.
