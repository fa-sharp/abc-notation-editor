# ABC Music Notation Editor

[![library CI status](https://github.com/fa-sharp/abc-notation-editor/actions/workflows/lib.yml/badge.svg)](https://github.com/fa-sharp/abc-notation-editor/actions/workflows/lib.yml)
[![docs site CI status](https://github.com/fa-sharp/abc-notation-editor/actions/workflows/docs.yml/badge.svg)](https://github.com/fa-sharp/abc-notation-editor/actions/workflows/docs.yml)

⚠️⚠️⚠️ Currently in alpha stage and missing a lot of features. Things _will_ break. Use at your own risk! ⚠️⚠️⚠️

A visual music notation editor, using [ABC notation](https://abcnotation.com/) and built on top of the [abcjs](https://github.com/paulrosen/abcjs) rendering library.

## Installation

Add the corresponding package for your framework (only React available for now), as well as the [abcjs](https://github.com/paulrosen/abcjs) library, which acts as the rendering engine.

```bash
npm install @abc-editor/react@alpha abcjs
# or
pnpm add @abc-editor/react@alpha abcjs
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
