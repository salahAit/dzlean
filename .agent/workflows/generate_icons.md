---
description: Generate 3D Islamic icons, remove backgrounds, and optimize to WebP
---

# Icon Generation & Optimization Workflow

This workflow automates the creation of the "Realistic Classical" 3D icons.

## 1. Preparation

- Read `brain/53b0eb7a-55c2-4193-8d76-efb5a866cf1f/icon_prompts.md` to retrieve the prompt text for each icon.

## 2. Generation (Requires Quota)

For each icon (start with `aqeedah`, then others: `hadith`, `fiqh`, `tafsir`, `usul`, `seerah`):

1.  **Generate Image**: Use `generate_image` tool.
    - **Name**: `[icon_name]_raw` (e.g., `aqeedah_raw`)
    - **Prompt**: Use the specific prompt from `icon_prompts.md` + the style suffix.

## 3. Background Removal

For each generated `[icon_name]_raw.png`:

1.  **Remove Background**: Run the local background removal service.
    - Command: `curl -X POST -F "file=@[icon_name]_raw.png" -o static/icons/[icon_name].png http://0.0.0.0:8000/remove`
    - _Verify_: Check if the output file exists and has a non-zero size.

## 4. Optimization

Once all icons are generated and backgrounds removed:

1.  **Optimize**: Run the conversion script.
    - Command: `bash conver.sh`
    - _Note_: This will automatically create `.webp` versions, `-small.webp` versions, and optimize the `.png` fallbacks.

## 5. Verification

1.  **Clean up**: Delete the `*_raw.png` files if the process was successful.
2.  **Verify**: List `static/icons/` to ensure all `[name].webp` and `[name]-small.webp` files exist.
