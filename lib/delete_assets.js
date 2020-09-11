"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delete_assets = void 0;
const github = __importStar(require("@actions/github"));
const core = __importStar(require("@actions/core"));
const utils_1 = require("./utils");
function toBoolean(input) {
    return (input || "true").toUpperCase() === "TRUE";
}
async function delete_assets() {
    const repo = github.context.repo;
    const token = core.getInput("token");
    const client = new github.GitHub(token);
    const fail_if_no_release = toBoolean(core.getInput("fail-if-no-release"));
    const fail_if_no_assets = toBoolean(core.getInput("fail-if-no-assets"));
    const tag_name = core.getInput("tag");
    // GITHUB_REF is of the format refs/tag/tagname so remove the prefix
    const tag = tag_name.replace("refs/tags/", "").trim();
    if (tag.length == 0) {
        throw new Error("Tag name cannot be empty.");
    }
    const asset_patterns = utils_1.parse_assets(core.getInput("assets"));
    if (asset_patterns.length == 0) {
        throw new Error("At least one file name or pattern must be specified.");
    }
    console.log(`Looking for release with tag '${tag}'...`);
    // getReleaseByTagName does not search for drafts
    const releases = await client.repos.listReleases(repo);
    const release = releases.data.find(r => r.tag_name == tag);
    if (release === undefined) {
        const msg = `No release with tag '${tag}' found.`;
        if (fail_if_no_release) {
            throw new Error(msg);
        }
        else {
            console.log(msg);
            return;
        }
    }
    console.log(`Found release '${release.name}' with ${release.assets.length} assets.`);
    for (const asset of release.assets) {
        console.log(`  ${asset.id} '${asset.name}'`);
    }
    console.log(`matching against:`);
    asset_patterns.forEach(pattern => console.log(`  '${pattern}'`));
    const assets_to_delete = release.assets
        .filter(asset => utils_1.matches_any(asset.name, asset_patterns));
    if (assets_to_delete.length == 0) {
        const msg = "No assets in the release match the provided patterns.";
        if (fail_if_no_assets) {
            throw new Error(msg);
        }
        else {
            console.log(msg);
            return;
        }
    }
    console.log("delete matching assets:");
    for (const asset of assets_to_delete) {
        console.log(`  ${asset.id} '${asset.name}'`);
        await client.repos.deleteReleaseAsset({ ...repo, asset_id: asset.id });
    }
    core.setOutput("deleted-assets", assets_to_delete.map(a => a.name).join(";"));
    core.setOutput("release-id", release.id.toString());
}
exports.delete_assets = delete_assets;
//# sourceMappingURL=delete_assets.js.map