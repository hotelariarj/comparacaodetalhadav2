import fs from "node:fs";
import process from "node:process";
import { parse } from "@babel/parser";

const sourcePath = new URL("../src/App.jsx", import.meta.url);
const source = fs.readFileSync(sourcePath, "utf8");
const drilldownSource = fs.readFileSync(new URL("../src/AccountDrilldown.jsx", import.meta.url), "utf8");
const ast = parse(source, { sourceType: "module", plugins: ["jsx"] });
const failures = [];

if (!source.includes("openAccountComparison = (account)") || !source.includes("<AccountDrilldown account={selectedAccount}")) {
  failures.push("V2 deve repassar a conta escolhida da Home para a comparação detalhada");
}
if (!drilldownSource.includes('className="comparison-ledgers"') || !drilldownSource.includes("Resumo da Conta")) {
  failures.push("V2 deve preservar o detalhe contínuo fiel ao fluxo atual do Lovable");
}
if (drilldownSource.includes('className="workspace-tabs"')) {
  failures.push("V2 não deve incorporar o workspace em abas exclusivo da V1");
}

function attribute(opening, name) {
  return opening.attributes.find((item) => item.type === "JSXAttribute" && item.name.name === name);
}

function literalValue(attr) {
  if (!attr?.value) return true;
  if (attr.value.type === "StringLiteral") return attr.value.value;
  return undefined;
}

function visit(node) {
  if (!node || typeof node !== "object") return;
  if (node.type === "JSXOpeningElement" && node.name.type === "JSXIdentifier") {
    const name = node.name.name;
    const line = node.loc?.start.line ?? 0;
    const staticControl = attribute(node, "data-static-control");
    if ((name === "button" || name === "IconButton") && !staticControl) {
      const hasAction = Boolean(attribute(node, "onClick") || attribute(node, "type") || attribute(node, "disabled"));
      if (!hasAction) failures.push(`linha ${line}: <${name}> sem onClick, type ou disabled`);
    }
    if (name === "a" && literalValue(attribute(node, "href")) === "#") {
      failures.push(`linha ${line}: link com href="#" não navega`);
    }
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object" && value.type) visit(value);
  }
}

visit(ast);

if (failures.length) {
  console.error("INTERACTION_AUDIT_FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("INTERACTION_AUDIT_PASSED");
