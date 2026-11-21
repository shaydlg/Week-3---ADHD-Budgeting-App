---
name: web-accessibility
description: Use for ANY user-facing UI change (components, pages, forms, images, color, icons, buttons, modals, menus, focus, keyboard behavior, or content) to make it usable by people with visual, motor, auditory, cognitive, and speech disabilities. Target WCAG 2.2 Level AA. Trigger on words like accessible, a11y, WCAG, ADA, Section 508, alt text, contrast, screen reader, keyboard, focus, ARIA, or on any code that renders UI even when those words are absent.
---

# Web Accessibility (WCAG 2.2 AA)

## Why this exists

About one in six people lives with a disability. Every screen you ship is used by people who are
blind or low-vision, cannot use a mouse, are deaf or hard of hearing, have limited dexterity, or have
cognitive differences. Accessibility is the line between "everyone can use this" and "some people are
locked out." It is also a legal requirement in most places (ADA, Section 508). It is far cheaper to
build in than to bolt on later.

## The main idea

Use the right native HTML element first, add ARIA only to fill real gaps, then verify with automation,
the keyboard, and a screen reader. Most accessibility comes free from semantic HTML. Nothing counts as
"accessible" until it has been operated without a mouse and heard through a screen reader.

Organize the work around WCAG's four principles, POUR: Perceivable, Operable, Understandable, Robust.

## The checklist

1. **Semantic HTML.** Use `<button>`, `<nav>`, `<label>`, `<h1>`-`<h6>` for their real purpose. Do not
   fake a button with a `<div>`.
2. **Keyboard.** Every interactive element works with Tab, Enter, and Escape. The focus outline is
   visible. Tab order follows reading order.
3. **Images and icons.** Meaningful images have descriptive `alt` text. Decorative images have empty
   `alt=""`.
4. **Color and contrast.** Text meets at least 4.5:1 contrast (3:1 for large text). Never use color
   alone to carry meaning (add a label or icon).
5. **Forms.** Every input has a visible, linked `<label>`. Errors are described in text, not just color.
6. **Verify.** Run an automated checker (like axe), then test by keyboard only, then with a screen
   reader. Automated tools catch only about a third of issues, so manual checks are required.

## Cognitive accessibility (COGA)

WCAG 2.2 AA is the testable floor, but it only lightly covers thinking, memory, and attention. The
W3C's COGA guidance ("Making Content Usable for People with Cognitive and Learning Disabilities") fills
that gap. It helps people with ADHD, learning differences, and memory or language difficulties, and also
everyone who is tired, stressed, rushed, or new. Treat it as design guidance that complements the
pass/fail criteria above, not a separate box to tick.

1. **Plain language.** Short sentences, common words, one idea at a time. Explain, do not jargon.
2. **One main action per screen.** Make the primary thing obvious and reduce competing choices.
3. **Few, short steps.** Break a task into small steps, show progress, and let people stop and resume.
4. **Consistent, predictable layout.** Same things in the same place; navigation and controls do not move.
5. **Do not rely on memory.** Keep needed info on screen; avoid codes or details the user must recall or re-enter.
6. **Prevent and forgive errors.** Clear labels and examples up front; calm, specific recovery with undo, never blame.
7. **Obvious, familiar controls.** Buttons look like buttons; icons carry text labels; link text says where it goes.
8. **Calm visuals.** Avoid clutter, autoplay, flashing, and time pressure; give enough time and a way to extend it.

Note: WCAG 2.2 folded in a few cognitively driven criteria you *can* test, such as Consistent Help
(3.2.6), Redundant Entry (3.3.7), and Accessible Authentication (3.3.8). Cover those as AA, and use the
patterns above for everything AA does not reach.

## How to prove it

State which WCAG success criteria the change touches, and how each was checked (automated, keyboard,
screen reader). "We tried" is not conformance. Accessibility is built and tested, like correctness.
