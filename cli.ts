#!/usr/bin/env node
import * as compiler from "@remix-pwa/dev"

async function cli() {
  await compiler.run();
}

cli();