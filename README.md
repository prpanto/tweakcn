# Tweakcn

> [!IMPORTANT]
> A very big thanks to [Brandon McConnell](https://github.com/brandonmcconnell)


Global shorthand for `shadcn-vue add` with automatic package manager detection.

`tweakcn` forwards all flags and arguments directly to `shadcn-vue@latest add`, while detecting your package manager (npm, pnpm, yarn, bun, or deno) so you don't have to remember which runner to use. Detection is powered by `package-manager-detector`.

```diff
Before
- pnpm dlx shadcn-vue@latest add
- npx shadcn-vue@latest add
- yarn shadcn-vue@latest add
- bunx --bun shadcn-vue@latest add
- deno run -A npm:shadcn-vue@latest add

After
+ tweakcn
```

## Why?

- **One command, any package manager**: Auto-detects npm, pnpm, yarn, bun, or deno and runs the correct `shadcn-vue add` variant for you.
- **No new flags to learn**: Everything after `tweakcn` is passed straight through to `shadcn-vue add`.
- **Monorepo-friendly**: Uses `package-manager-detector` to crawl upwards and detect the right tool for the nearest repository root.

## Install (global)

```bash
npm i -g tweakcn@latest
# or
pnpm add -g tweakcn@latest
# or
yarn global add tweakcn@latest
# or
bun add -g tweakcn@latest
```

## Usage

All options are passed through to `shadcn-vue add` exactly as-is.

```bash
# Wizard mode (interactive prompts)
tweakcn

# Add a single component
tweakcn button

# Add multiple components
tweakcn button card dialog

# Pass-through flags (examples; all flags pass through to shadcn-vue add)
tweakcn -y --overwrite button

# Using registries (names, URLs, or local paths are supported by shadcn-vue)
tweakcn @8bitcn/accordion
tweakcn https://example.com/registry/components/button.json
```

Under the hood, `tweakcn` maps to the correct package manager command automatically:

- pnpm: `pnpm dlx shadcn-vue@latest add ...`
- npm: `npx shadcn-vue@latest add ...`
- yarn: `yarn shadcn-vue@latest add ...`
- bun: `bunx --bun shadcn-vue@latest add ...`
- deno: `deno run -A npm:shadcn-vue@latest add ...`

## Notes

- Must be run inside an active git repository; otherwise, `tweakcn` will exit with an error.
- If a supported package manager cannot be detected, `tweakcn` will exit with an error.
- Package manager detection is provided by [`package-manager-detector`](https://github.com/antfu-collective/package-manager-detector).

## License

MIT
