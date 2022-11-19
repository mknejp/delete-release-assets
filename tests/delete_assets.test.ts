import Core from "@actions/core";
import GitHub from "@actions/github";
import { delete_assets } from "../src/delete_assets"

jest.mock("@actions/core", () => ({
  getInput: jest.fn(),
  setOutput: jest.fn(),
}));
jest.mock("@actions/github", () => ({
  context: {
    repo: {
      owner: "owner",
      repo: "repo",
    }
  },
  getOctokit: jest.fn(),
}));

const getInput = Core.getInput as jest.Mock;
const setOutput = Core.setOutput as jest.Mock;
// Suppress console output in tests
jest.spyOn(console, 'log').mockImplementation(() => { });

function mock_input(tag: string, assets: string) {
  return (input_name: string): string => {
    switch (input_name) {
      case "token":
        return "token";
      case "tag":
        return tag;
      case "fail-if-no-release":
        return "true";
      case "fail-if-no-assets":
        return "true";
      case "assets":
        return assets;
      case "repository":
        return '';
      default:
        throw new Error(`Unrecognized input name '${input_name}'`);
    }
  };
}

interface Input {
  tag_name: string,
  assets: string
}

interface Asset {
  name: string,
  id: number,
}

let listReleases: jest.Mock<any, any>;
let deleteReleaseAsset: jest.Mock<any, any>;

function setup(input: Input, assets: Asset[]) {
  listReleases = jest.fn().mockReturnValueOnce({
    data: [
      {
        name: "my-release",
        tag_name: input.tag_name.replace("refs/tags/", ""),
        id: 1,
        assets: assets,
      },
      {
        name: "other-release",
        tag_name: "no-tag",
        id: 2,
        assets: [],
      },
    ]
  });

  deleteReleaseAsset = jest.fn().mockReturnValueOnce({});

  const github = {
    rest: {
      repos: {
        listReleases,
        deleteReleaseAsset,
      }
    }
  };

  (GitHub.getOctokit as any as jest.Mock).mockImplementation(() => github);
  getInput.mockImplementation(mock_input(input.tag_name, input.assets));
  setOutput.mockClear();
}

describe("Delete Release Assets", () => {

  test("call deleteReleaseAsset for each matching asset", async () => {
    setup(
      { tag_name: "v1.0.0", assets: "foo.txt" },
      [{ name: "foo.txt", id: 1 }, { name: "bar.txt", id: 2 }]
    );

    await delete_assets();

    expect(deleteReleaseAsset).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      asset_id: 1,
    });
    expect(setOutput).toHaveBeenCalledWith("deleted-assets", "foo.txt")
  });

  // Same as above but with refs/tags/
  test("call deleteReleaseAsset for each matching asset", async () => {
    setup(
      { tag_name: "refs/tags/v1.0.0", assets: "foo.txt" },
      [{ name: "foo.txt", id: 1 }, { name: "bar.txt", id: 2 }]
    );

    await delete_assets();

    expect(deleteReleaseAsset).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      asset_id: 1,
    });
    expect(setOutput).toHaveBeenCalledWith("deleted-assets", "foo.txt")
  });

  test("call deleteReleaseAsset for each matching asset", async () => {
    setup(
      { tag_name: "v1.0.0", assets: "bar.txt" },
      [{ name: "foo.txt", id: 1 }, { name: "bar.txt", id: 2 }]
    );

    await delete_assets();

    expect(deleteReleaseAsset).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      asset_id: 2,
    });
    expect(setOutput).toHaveBeenCalledWith("deleted-assets", "bar.txt")
  });

  test("call deleteReleaseAsset for each matching asset", async () => {
    setup(
      { tag_name: "v1.0.0", assets: "foo.txt\nbar.txt" },
      [{ name: "foo.txt", id: 1 }, { name: "bar.txt", id: 2 }]
    );

    await delete_assets();

    expect(deleteReleaseAsset).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      asset_id: 1,
    });
    expect(deleteReleaseAsset).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      asset_id: 2,
    });
    expect(setOutput).toHaveBeenCalledWith("deleted-assets", "foo.txt;bar.txt")
  });

  test("call deleteReleaseAsset for each matching asset", async () => {
    setup(
      { tag_name: "v1.0.0", assets: "*.txt" },
      [{ name: "foo.txt", id: 1 }, { name: "bar.txt", id: 2 }]
    );

    await delete_assets();

    expect(deleteReleaseAsset).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      asset_id: 1,
    });
    expect(deleteReleaseAsset).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      asset_id: 2,
    });
    expect(setOutput).toHaveBeenCalledWith("deleted-assets", "foo.txt;bar.txt")
  });

  test("call deleteReleaseAsset for each matching asset", async () => {
    setup(
      { tag_name: "v1.0.0", assets: "*" },
      [{ name: "foo.txt", id: 1 }, { name: "bar.txt", id: 2 }]
    );

    await delete_assets();

    expect(deleteReleaseAsset).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      asset_id: 1,
    });
    expect(deleteReleaseAsset).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      asset_id: 2,
    });
    expect(setOutput).toHaveBeenCalledWith("deleted-assets", "foo.txt;bar.txt")
  });

  test("set release_id output", async () => {
    setup(
      { tag_name: "v1.0.0", assets: "*.txt" },
      [{ name: "foo.txt", id: 1 }, { name: "bar.txt", id: 2 }]
    );

    await delete_assets();

    expect(setOutput).toHaveBeenCalledWith("release-id", "1")
  });
});