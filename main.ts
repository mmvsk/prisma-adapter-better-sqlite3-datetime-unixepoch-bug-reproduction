import { PrismaClient } from "./prisma/generated/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

if (import.meta.main) {
  console.log(fmtBold("@prisma/adapter-better-sqlite3 DateTime Bug Reproduction"));
  console.log(fmtDim(`unixepoch-ms format returns Invalid Date\n`));

  await runTest("iso8601");
  await runTest("unixepoch-ms");
}

async function runTest(format: "iso8601" | "unixepoch-ms") {
  console.log(fmtBold(`Test: timestampFormat: "${format}"`));

  await using prisma = createClient({ timestampFormat: format });

  if (format === "iso8601") {
    await prisma.$executeRaw`
      CREATE TABLE Post (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `;
  } else {
    await prisma.$executeRaw`
      CREATE TABLE Post (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        createdAt INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
      )
    `;
  }

  const post = await prisma.post.create({ data: { id: 1, title: "test" } });
  console.log(fmtDim("  create() ->"), JSON.stringify(post));

  const createValid = isValidDate(post.createdAt);
  if (createValid) {
    console.log(fmtGreen("  PASS"), fmtDim("createdAt is valid Date"));
  } else {
    console.log(fmtRed("  FAIL"), `createdAt is ${post.createdAt}`);
  }

  const agg = await prisma.post.aggregate({
    _min: { createdAt: true },
    _max: { createdAt: true },
  });
  console.log(fmtDim("  aggregate() ->"), JSON.stringify(agg));

  const aggValid = isValidDate(agg._min.createdAt) && isValidDate(agg._max.createdAt);
  if (aggValid) {
    console.log(fmtGreen("  PASS"), fmtDim("_min/_max createdAt are valid Dates"));
  } else {
    console.log(fmtRed("  FAIL"), `_min.createdAt is ${agg._min.createdAt}`);
  }

  console.log();
}

function createClient(options: { timestampFormat: "iso8601" | "unixepoch-ms" }) {
  const adapter = new PrismaBetterSqlite3({ url: ":memory:" }, options);
  const prisma = new PrismaClient({ adapter });

  return Object.assign(prisma, {
    [Symbol.asyncDispose]: () => prisma.$disconnect(),
  });
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

function fmtDim(s: string) { return `\x1b[2m${s}\x1b[0m`; }
function fmtGreen(s: string) { return `\x1b[32m${s}\x1b[0m`; }
function fmtRed(s: string) { return `\x1b[31m${s}\x1b[0m`; }
function fmtBold(s: string) { return `\x1b[1m${s}\x1b[0m`; }
