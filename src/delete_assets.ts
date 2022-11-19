import * as github from "@actions/github";
import * as core from "@actions/core";
import { parse_assets, matches_any } from "./utils"

function toBoolean(input: string) {
  return (input || "true").toUpperCase() === "TRUE";
}

function getRepo() {
  const repository = core.getInput("repository");

  if (repository) {
    const repositoryParts = repository.split('/');

    return {
      owner: repositoryParts[0],
      repo: repositoryParts[1]
    };
  }

  return github.context.repo;
}

export async function delete_assets() {
  const repo = getRepo();
  const token = core.getInput("token");
  const client = github.getOctokit(token);

  const fail_if_no_release = toBoolean(core.getInput("fail-if-no-release"));
  const fail_if_no_assets = toBoolean(core.getInput("fail-if-no-assets"));

  const tag_name = core.getInput("tag");
  // GITHUB_REF is of the format refs/tag/tagname so remove the prefix
  const tag = tag_name.replace("refs/tags/", "").trim();
  if (tag.length == 0) {
    throw new Error("Tag name cannot be empty.");
  }

  const asset_patterns = parse_assets(core.getInput("assets"));
  if (asset_patterns.length == 0) {
    throw new Error("At least one file name or pattern must be specified.");
  }

  console.log(`Looking for release with tag '${tag}'...`);
  // getReleaseByTagName does not search for drafts
  const releases = await client.rest.repos.listReleases(repo);

  const release = releases.data.find(r => r.tag_name == tag);
  if (release === undefined) {
    const msg = `No release with tag '${tag}' found.`;
    if (fail_if_no_release) {
      throw new Error(msg);
    } else {
      console.log(msg);
      return;
    }
  }
  console.log(`Found release '${release.name}' with ${release.assets.length} assets.`);

  for (const asset of release.assets) {
    console.log(`  ${asset.id} '${asset.name}'`);
  }

  console.log(`matching against:`);
  asset_patterns.forEach(pattern => console.log(`  '${pattern}'`))
  const assets_to_delete = release.assets
    .filter(asset => matches_any(asset.name, asset_patterns));

  if (assets_to_delete.length == 0) {
    const msg = "No assets in the release match the provided patterns.";
    if (fail_if_no_assets) {
      throw new Error(msg);
    } else {
      console.log(msg);
      return;
    }
  }

  console.log("delete matching assets:");
  for (const asset of assets_to_delete) {
    console.log(`  ${asset.id} '${asset.name}'`);
    await client.rest.repos.deleteReleaseAsset({ ...repo, asset_id: asset.id });
  }

  core.setOutput("deleted-assets", assets_to_delete.map(a => a.name).join(";"));
  core.setOutput("release-id", release.id.toString());
}