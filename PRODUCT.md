# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students first: self-taught learners and university students working through the Nand2Tetris course (projects 1 to 12, from logic gates to the operating system) in a browser instead of installing the desktop suite. Instructors and TAs who teach and grade with the tool are a secondary audience; when needs conflict, the student's flow wins.

## Product Purpose

A browser reimplementation of the Nand2Tetris software suite from "The Elements of Computing Systems" (Nisan and Schocken, 2nd edition), so students can complete every course project without downloading code. It bundles the Hardware Simulator, CPU Emulator, Assembler, VM Emulator, Bitmap Editor, and Jack Compiler, with the course's HDL, ASM, VM, and Jack project files built in. Success is a student finishing a project and seeing their tests pass, with the tool never being the obstacle.

## Positioning

The official-lineage, open-source, no-install successor to the venerable Java desktop suite: same course, same languages and file formats, with nothing to set up. The web IDE is hosted at nand2tetris.github.io/web-ide.

## Operating Context

- Work happens in a project and chip/program selector, an editor (Monaco) for HDL/ASM/VM/Jack, simulated state panels (pins, CPU, RAM, ROM, screen, keyboard), and a test panel with script, expected output (CMP), actual output, and a diff of failing lines.
- Files live in browser storage by default; in Chromium browsers the user can upgrade to a folder on their own computer. A reset action restores the book's skeleton files.
- Used alongside the book and course materials; a User Guide is reachable from the header.
- Used in classrooms, where instructors may need the same behavior from the web tool as from the desktop suite and the CLI grader.

## Capabilities and Constraints

- Monorepo: `projects`, `runner`, `simulator`, `components`, `web`, `cli`, `e2e`. UI lives in `web` (Vite SPA, React 19, Radix and Tailwind CSS v4 primitives, SCSS), `components` (shared React with Immer and RxJS stores).
- Tool names and terminology follow the book: Hardware Simulator, CPU Emulator, Assembler, VM Emulator, Bitmap Editor, Jack Compiler.
- Fidelity: tool behavior, languages, test scripts, and file formats must stay faithful to the book and the Java desktop suite; `runner` exists to check conformance against the reference implementation.
- Local-first: runs entirely in the browser, with no accounts and no server for student work.
- Internationalization: `web` user-facing text goes through Lingui (`en` source, `en-PL` pseudolocale). Layouts must tolerate longer strings and future locales. No human translations exist yet.
- `components` does not use Lingui.
- Undecided: the UI is described as still experimenting ("we keep experimenting with different UIs"), so the User Guide screenshots may lag the code.

## Brand Commitments

- Name: "Nand to Tetris IDE Online" / "NAND2Tetris Web IDE". The project is open source and credits Noam Nisan and Shimon Schocken (course design), David Souther and Neta London (web IDE), Eric Umble (bitmap editor), and the original desktop suite authors. Credits appear on the About page and must be preserved.
- No logo or palette commitment has been confirmed beyond the existing assets in `web/public` (favicon, logo_192/512, Poppins and JetBrains Mono font files).

## Evidence on Hand

- Real course content: all HDL, ASM, VM, and Jack project files in `projects/`.
- `web/src/pages/ABOUT.md` and `web/src/pages/USER_GUIDE.md` describe the tools and flows.
- Desktop-suite lineage claims in ABOUT.md (such as 250,000+ users) belong to the original suite, not this product.
- No testimonials, case studies, usage numbers, or press for the web IDE are on hand. Future work must not invent any.

## Product Principles

1. Get out of the student's way: the tools are the product, and every screen serves the loop of write, simulate, test, fix.
2. Be faithful to the book: names, languages, behaviors, and file formats match the course, so what students learn here transfers to the book and desktop suite.
3. Make machine state legible: pins, buses, registers, memory, and test diffs are the teaching material, so they must be readable at a glance.
4. Student work is theirs: local-first storage, no accounts, and destructive actions (reset, overwrite) are explicit and recoverable where possible.
5. Ready for any language: all text is translatable and layouts hold up when strings grow.

## Accessibility & Inclusion

Keyboard operability and screen-reader support are required. The exact standard (for example WCAG 2.1 AA) has not been chosen and is an open decision. The UI must also support international learners through translation (see Capabilities and Constraints).
