"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matches_any = exports.parse_assets = void 0;
const nanomatch = require('nanomatch');
function parse_assets(asset_names) {
    return asset_names
        .split(/\r?\n/)
        .map(name => name.trim())
        .filter(name => name.length > 0);
}
exports.parse_assets = parse_assets;
function matches_any(asset, patterns) {
    return nanomatch.any(asset, patterns);
}
exports.matches_any = matches_any;
//# sourceMappingURL=utils.js.map