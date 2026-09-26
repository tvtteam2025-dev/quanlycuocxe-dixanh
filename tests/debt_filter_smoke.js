const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const source = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8");
const normalizeSource = source.slice(
  source.indexOf("function normalize(value)"),
  source.indexOf("const roleLabels"),
);
const matcherSource = source.slice(
  source.indexOf("function matchesDebtOrder(row, query)"),
  source.indexOf("function invoiceOrderStatus(row)"),
);
const context = {};
vm.createContext(context);
vm.runInContext(`${normalizeSource}\n${matcherSource}`, context);

const phanLinh = {
  id: "DH-20260913-015636762602-17A833",
  orderCode: "DH-20260913-015636762602-17A833",
  tenKhach: "Chị Phan Linh",
  soDienThoai: "0933612684",
  congNoChoAi: "CHỊ LINH (ĐĐHS)",
  ghiChu: "Liên hệ Chị Hậu khi đến điểm đón",
  nguoiTaoDon: "Chị Hậu",
};

assert.strictEqual(context.matchesDebtOrder(phanLinh, "CHỊ HẬU"), false);
assert.strictEqual(context.matchesDebtOrder(phanLinh, "phan linh"), true);
assert.strictEqual(context.matchesDebtOrder(phanLinh, "0933612684"), true);
assert.strictEqual(context.matchesDebtOrder(phanLinh, "chị linh"), true);
assert.strictEqual(context.matchesDebtOrder(phanLinh, "17A833"), true);
assert.strictEqual(context.matchesDebtOrder(phanLinh, ""), true);

console.log("debt filter smoke test: OK");
