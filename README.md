# SillyTavern Obsidian REST Bridge

Standalone SillyTavern server plugin that exposes a Termux-friendly, filesystem-backed subset of the Obsidian Local REST API.

## Status

Standalone extraction based on the proven DeepLore mobile bridge.

## Configuration

### Config file (recommended for Termux)

Environment variables exported in a shell do **not** survive a phone reboot,
so the bridge can silently fail to start after a restart. To make settings
persistent, copy the example file into the plugin folder and fill it in:

```sh
cp config.example.json config.json
```

Then edit `config.json` and set at least `vault` (absolute path to your
Obsidian vault) and `apiKey`. The file is JSON (not YAML) and lives next to
the plugin's `index.js`; it is git-ignored so your path and key are not
committed.

Precedence per setting: **environment variable → `config.json` → built-in
default.** Environment variables still win when set, so existing setups keep
working unchanged.

### Canonical environment variables

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

## Known Consumers

- DeepLore Enhanced

## Migration From The Embedded DLE Bridge

1. Clone this standalone repo into SillyTavern's `plugins/` folder.
2. Keep the same vault path and API key you already used with the embedded bridge.
3. Switch to the canonical `OBSIDIAN_REST_BRIDGE_*` env names when convenient; legacy aliases remain supported.
4. Point DLE at `127.0.0.1` and the configured bridge port.
