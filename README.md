# Orbit: PanPilot demo app

Orbit is a fictional enterprise SaaS workspace (projects, team, analytics, automations) built to show what PanPilot can do. The app isn't the star: **PanPilot is**, because it can operate the app by voice.

It uses the **published** `@panpilot/react@0.1.8` from npm, not the local SDK sources. This folder has its own `pnpm-workspace.yaml`, so it installs independently of the PanPilot monorepo.

## Run it

```bash
cd orbit
cp .env.example .env        # set VITE_PANPILOT_API_KEY (pk_live_…) from the PanPilot admin
pnpm install
pnpm dev                    # → http://localhost:5174
```

The PanPilot core server must be running (`VITE_PANPILOT_URL`, default `ws://localhost:3001/ws`).

## Set up the agent in the PanPilot admin

1. **System prompt**: paste `panpilot/system-prompt.md` into the agent's system prompt.
2. **Knowledge base**: upload `panpilot/knowledge/orbit-product-knowledge.md`. Keep `changelog-2.4.0.md` for the release moment in the demo (see below).
3. **Tools**: in the agent's Tool Manager, add the four client tools from `panpilot/tools.json`. Use the same name, description and parameters, with execution side set to Client.
4. Create an API key and put it in `.env`.

`navigate_to`, `read_current_page` and `show_tooltip` are built in; nothing needs adding for those.

## PanPilot tools in Orbit

| Tool | What the user sees |
|---|---|
| `navigate_to` | Routes to a page. Accepts ids like `analytics`, `smart-reports`, or a project slug such as `website-redesign` |
| `read_current_page` | Returns the page's data **plus every actionable element id** (`actions`) |
| `click_element` | A pilot cursor glides to the element, highlights it and clicks it |
| `search_workspace` | Types the query into the top search bar, character by character, and returns the results |
| `fill_input` | Types into a field or picks a dropdown option (e.g. the automation builder) |
| `toggle_setting` | Flips a switch (automations, notification and security settings) |
| `show_tooltip` | Points at an element with a tooltip (built into the SDK) |

Elements become targetable through the `pp()` helper (`src/panpilot/pp.ts`), which sets `data-pp` and `id`. Handlers live in `src/panpilot/tools.ts`.

## Demo script

1. **Navigation**: "Take me to the analytics page." → "Where can I see my active projects?"
2. **Deep link**: "How do I see the performance of the Website Redesign project?" (opens `/projects/website-redesign`)
3. **Product knowledge**: "What can I do with Orbit?" → "How do I create an automated weekly report?" (it takes you to Automations)
4. **Acting in the UI**:
   - "I want to start a project for our new customer onboarding flow. Can you suggest a title and description?" (opens New project, proposes title, description, template, owner, date and budget, fills the form, then creates it when you say "looks good, create it")
   - "Search for the mobile app and open it."
   - "Create a weekly report automation that emails leadership every Monday." (opens the builder, fills it in, saves)
   - "Pause the customer follow-up automation."
   - "Turn on single sign-on." (Settings → Security)
5. **The release**:
   - Publish 2.4.0 from **Settings → General → Releases → Publish 2.4.0**, or press **Alt+Shift+R**. Smart Reports then appears in the sidebar with a NEW badge, a dashboard banner and a notification.
   - Upload `panpilot/knowledge/changelog-2.4.0.md` in the admin.
   - Reload Orbit (the knowledge base is loaded when the PanPilot session connects), then ask "What's new in Orbit?" → "Show me Smart Reports." → "Generate this week's report." → "Schedule it weekly."

Press Alt+Shift+R again to roll the release back before the next run. The release state and theme are remembered in localStorage.
