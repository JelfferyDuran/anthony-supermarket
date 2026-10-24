---
name: anthony-food-photography
description: Transform owner-uploaded real Anthony's Super Kitchen food photos into premium, truthful menu-ready photography while preserving the actual dish and portion.
---

# Anthony's Grade-A Food Photography Skill

## Purpose
Apply the owner-approved visual direction ("the meta") to **every food photo explicitly submitted for enhancement** for Anthony's Supermarket / Super Kitchen. This is a reusable creative workflow for the signage, website, delivery listings, and promotions. Never auto-generate images on every run or publish without approval.

## Canonical reference
- Large Mangú con Los Tres Golpes: owner photo of a **$12.00 large 7-inch aluminum pan** with mangú, fried salami, fried egg, fried cheese, and pink pickled onions. Approved Grade-A aesthetic: close-up premium commercial food photography, natural appetizing texture, polished lighting, warm restrained setting, sharp food detail, authentic Dominican character.
- Small Mangú con Los Tres Golpes: owner photo of a **$7.00 small white hinged compartment takeout container**, same three golpes and pink onions. Preserve this smaller white container; **do not swap it for the large aluminum pan**.
- The images in chat are reference assets, **not automatically available inside the repository**. Do not claim the repo contains the originals or generated outputs unless they have actually been uploaded there.

## Non-negotiable fidelity
1. The owner photo is the ground truth. Preserve the recognizable actual dish, ingredients, quantities, portion scale, arrangement, container type and structure. No invented sides, garnishes, extra protein, or larger serving.
2. Retain the product's identity and authentic Dominican food character. Correct distracting lighting, glare, color casts, blur, background clutter, packaging imperfections, and distracting reflections only where realistic.
3. Improve lighting, texture, detail, framing, color accuracy, depth and composition to Grade-A food-advertising quality. Keep edible surfaces realistic rather than plastic-looking or oversaturated.
4. A premium image must still represent what a customer can expect to receive. If a change might materially misrepresent the food, request approval.
5. Preserve a traceable source image and an edited derivative. Never overwrite the original.
6. Keep generated food images in draft until an authorized owner/manager reviews and approves them. Do not auto-publish to signage, POS, DoorDash, or website.
7. Do not invent or change prices based on image content. Use only owner-approved channel-specific price-book records.

## Default creative treatment
- Premium, warm commercial food photography; appetizing true-to-life colors, natural food textures, controlled highlights, clean sharp subject, softly de-emphasized background.
- Keep packaging and arrangement recognizable. Remove visual distractions without making the container or portion look like a different product.
- No text, watermarks, logos, badges, or prices baked into the food photo by default; the design system adds overlays.
- Preserve practical negative space only when it doesn't shrink or distort the food.

## Standard workflow
1. Identify dish, size, container, included ingredients and channel; compare with approved price book.
2. Flag ambiguity before transforming: wrong portion, missing dish name, uncertain ingredients, or unclear packaging.
3. Create an enhancement using the uploaded photo as reference, explicitly preserving structure and portion.
4. Review side-by-side against the original: ingredient fidelity, serving size, container, lighting, appetizing realism, artifacts.
5. Obtain owner approval for the final visual. Record original asset, derivative asset, product/variant ID, prompt/version, approver, approval date, intended channels.
6. Export channel-specific crops from the approved master (e.g. 16:9 signage, square/portrait ordering), avoiding important-content cropping. Validate each channel's actual requirements before exporting.
7. Publish only via the existing approved workflow, with rollback. Keep live signage untouched during draft work.

## Reusable enhancement prompt
"Enhance the attached **real Anthony's Super Kitchen product photo** into Grade-A premium commercial food photography. Preserve the exact dish identity, ingredient types, realistic portion quantity, arrangement, and original container shape and material; do not add or remove food or change serving size. Improve realistic food texture, natural color, clarity, soft directional light, controlled highlights, background cleanliness, and elegant composition. Keep an authentic Dominican kitchen feeling with a refined warm presentation. No text or watermarks. The result must remain truthful to what the store serves."

## Quality gate
Reject and revise if: container differs; portion inflated; ingredients changed; food looks synthetic; overprocessing obscures original; important food cropped; pricing/channel label unapproved; source photo lost; or final image not approved.

## System integration notes
- Design once, distribute approved assets to multiple channels.
- Product catalog holds the source/approved media references; signage consumes an approved, versioned snapshot.
- Hermes may automate preparation, checks, resizing, and diagnostics but must not independently approve prices, images, or live publishing.
- Multi-business future: keep this as Anthony's brand-specific skill; do not impose its aesthetic on other tenants.
