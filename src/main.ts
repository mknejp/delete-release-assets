import * as core from "@actions/core";
import { delete_assets } from "./delete_assets";

async function run() {
  try {
    await delete_assets();
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
