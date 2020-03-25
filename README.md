# GitHub Action - Delete Release Assets

This GitHub action lets you delete assets from existing GitHub releases. This is useful for scenarios where the artifacts of nightly builds are made available in a GitHub release and cannot be just overwritten because the asset names contain changing information like the build date or commit ID.

## Usage

Typical usage would be adding this action as a step before uploading new assets to a release (for example using the [`@actions/upload-release-asset`](https://www.github.com/actions/upload-release-asset) GitHub action).

### Inputs

| name                 | required | default | description                                                            
|----------------------|:--------:|---------|-------------
| `assets`             | **yes**  |         | Newline-delimited globs of asset names to delete from the release. See the example below for supported formats.
| `fail-if-no-assets`  | no       | `true`  | Fail the action if the release contains no matching assets.
| `fail-if-no-release` | no       | `true`  | Fail the action if no release associated with the given tag was found.
| `token`              | **yes**  |         | The token for authenticating against the GitHub API.
| `tag`                | **yes**  |         | The name of the tag. This uniquely identifies the release. May either be a tag name directly (like `v1.0.0`) or a tag ref (like `refs/tags/v1.0.0` as is provided by `github.ref` or `GITHUB_REF`).

### Outputs

| name             | example               | description 
|------------------|-----------------------|-------------
| `deleted-assets` | `file1.txt;file2.zip` | Semicolon-delimited list of deleted asset names.
| `release-id`     | `1234`                | The unique ID of the github release from which the assets were deleted.

### Example workflow

On every push to the staging branch delete existing assets from the release with the tag `staging`.

```yaml
name: Stage build

on:
  push:
    branches:
      - stage

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
        
      - name: Build project
        run: ./build
        
      - name: Delete old release assets
        uses: mknejp/delete-release-assets@v1
        with:
          token: ${{ github.token }}
          tag_name: staging # This may also be of the form 'refs/tags/staging'

          # Pick one of:
          # 1. a single file name
          assets: changelog.txt
          # 2. a glob pattern (note the quotes if it begins with *)
          assets: '*.zip'
          # 3. multiple names/globs, one per line
          assets: | 
            changelog.txt
            *.zip
            
      - name: Upload new release assets
        uses: actions/upload-release-assets@v1
        ...
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
