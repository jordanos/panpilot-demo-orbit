/**
 * Marks an element as operable by PanPilot. The same value goes in `data-pp`
 * (for click_element / fill_input / toggle_setting) and `id` (the built-in
 * show_tooltip tool looks elements up by id). Keep values unique per page.
 */
export function pp(id: string, label?: string) {
  return { 'data-pp': id, id, ...(label ? { 'data-pp-label': label } : {}) };
}
