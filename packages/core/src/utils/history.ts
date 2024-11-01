interface Diff {
  p1: number;
  p2: number;
  patch: string;
  old: string;
}

export class History {
  edits: Diff[] = [];
  editIdx = 0;

  addEdit(oldAbc: string, newAbc: string) {
    if (this.editIdx < this.edits.length)
      this.edits = this.edits.slice(0, this.editIdx);
    const patch = calcPatch(oldAbc, newAbc);
    this.edits.push({
      old: oldAbc.slice(patch.p1, oldAbc.length - patch.p2),
      ...patch,
    });
    this.editIdx++;
  }

  undo(abc: string) {
    const edit = this.prevEdit;
    if (!edit) return abc;

    this.editIdx--;
    return abc.slice(0, edit.p1) + edit.old + abc.slice(abc.length - edit.p2);
  }

  redo(abc: string) {
    const edit = this.nextEdit;
    if (!edit) return abc;

    this.editIdx++;
    return abc.slice(0, edit.p1) + edit.patch + abc.slice(abc.length - edit.p2);
  }

  get prevEdit() {
    return this.edits[this.editIdx - 1];
  }

  get nextEdit() {
    return this.edits[this.editIdx];
  }
}

function calcPatch(str1: string, str2: string) {
  let p1 = 0;
  let p2 = 0;
  for (let i = 0; i < str1.length; ++i) {
    if (str1[i] === str2[i]) ++p1;
    else break;
  }
  const max_p2 = Math.min(str1.length, str2.length) - p1;
  for (let i = 0; i < max_p2; ++i) {
    if (str1[str1.length - i - 1] === str2[str2.length - i - 1]) ++p2;
    else break;
  }
  const patch = str2.slice(p1, str2.length - p2);
  return { p1: p1, p2: p2, patch: patch };
}
