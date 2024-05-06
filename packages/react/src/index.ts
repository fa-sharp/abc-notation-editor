import Keyboard from "./components/piano/Keyboard";
import ABCEditor from "./components/editor/Editor";
import EditorControls from "./components/editor/EditorControls";
import Score from "./components/notation/Score";
import { EditorProvider, useEditorContext } from "./context/EditorContext";
import type { EditorChangeHandler as ABCEditorChangeHandler } from "./components/editor/Editor";

export {
  ABCEditor,
  type ABCEditorChangeHandler,
  Keyboard,
  EditorControls,
  Score,
  EditorProvider,
  useEditorContext,
};
