# ABC Music Notation Editor

[![npm react](https://img.shields.io/npm/v/%40abc-editor/react?label=npm%3A%20react)](https://www.npmjs.com/package/@abc-editor/react)
[![library CI status](https://github.com/fa-sharp/abc-notation-editor/actions/workflows/lib.yml/badge.svg)](https://github.com/fa-sharp/abc-notation-editor/actions/workflows/lib.yml)

⚠️⚠️⚠️ In alpha stage and missing a lot of features. Use at your own risk! ⚠️⚠️⚠️

A visual music notation editor, using [ABC notation](https://abcnotation.com/) and built on top of the [abcjs](https://github.com/paulrosen/abcjs) rendering library.

## Installation

Add the corresponding package for your framework (only React available for now), as well as the [abcjs](https://github.com/paulrosen/abcjs) library, which acts as the rendering engine.

```bash
npm install @abc-editor/react abcjs
# or
pnpm add @abc-editor/react abcjs
# etc...
```

## Usage

### React

```jsx
"use client"; // if needed - see https://react.dev/reference/react/use-client

import { ABCEditor } from "@abc-editor/react";

function AbcNotationEditor() {
  return <ABCEditor minWidth={600} onChange={(abc) => console.log(abc)} />;
}
```

Keep in mind that rendering and editing sheet music relies heavily on browser APIs, so this should be be a client-side-only component.
