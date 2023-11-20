import { readFileSync } from "fs";
import readline from "readline";
import { Parser } from "./Parser";
import { Scanner } from "./Scanner";
import { TokensVisitor } from "./Visitors/SemanticTokens";
import { getError, setError } from "./error";

export let hadError = false;

const main = (args: string[]) => {
  if (args.length > 1) {
    console.log("Usage: abc [script]");
    return;
  } else if (args.length === 1) {
    runFile(args[0]);
  } else {
    runPrompt();
  }
};

function runFile(path: string) {
  const bytes = readFileSync(path, {
    encoding: "utf8",
  });
  run(bytes);
  if (getError()) {
    return;
  }
}

function runPrompt() {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.setPrompt("> ");
  rl.prompt();
  rl.on("line", (line) => {
    run(line);
    setError(false);
    rl.prompt();
  });
}

function run(source: string) {
  const scanner = new Scanner(source);
  const parser = new Parser(scanner.scanTokens(), source);
  const expression = parser.parse();

  if (hadError || getError() || !expression) {
    console.log("\nhad error");
    return;
  }
  const semanticTokensVisitor = new TokensVisitor();
  const semanticTokens = semanticTokensVisitor.analyze(expression).tokens;
  console.log("SemanticTokens: \n", semanticTokens);
}

main(process.argv.slice(2));
