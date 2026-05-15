# SillyTavern Obsidian REST Bridge

Standalone SillyTavern server plugin that exposes a Termux-friendly, filesystem-backed subset of the Obsidian Local REST API.

## Status

Standalone extraction based on the proven DeepLore mobile bridge.

## Configuration

Canonical environment variables:

- `OBSIDIAN_REST_BRIDGE_VAULT`
- `OBSIDIAN_REST_BRIDGE_API_KEY`
- `OBSIDIAN_REST_BRIDGE_HOST`
- `OBSIDIAN_REST_BRIDGE_PORT`
- `OBSIDIAN_REST_BRIDGE_FALLBACK_FIELDS`
- `OBSIDIAN_REST_BRIDGE_HIDE_ROOT_DOTFILES`
- `OBSIDIAN_REST_BRIDGE_DEBUG`

Legacy aliases remain supported for migration from the embedded DLE bridge:

- `OBSIDIAN_VAULT`
- `OBSIDIAN_API_KEY`
- `OBSIDIAN_API_HOST`
- `OBSIDIAN_API_PORT`
- `OBSIDIAN_API_FALLBACK_FIELDS`
- `OBSIDIAN_API_HIDE_ROOT_DOTFILES`
- `OBSIDIAN_API_DEBUG`
