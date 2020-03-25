const nanomatch = require('nanomatch');

export function parse_assets(asset_names: string) {
  return asset_names
    .split(/\r?\n/)
    .map(name => name.trim())
    .filter(name => name.length > 0);
}

export function matches_any(asset: string, patterns: string[]): boolean {
  return nanomatch.any(asset, patterns);
} 