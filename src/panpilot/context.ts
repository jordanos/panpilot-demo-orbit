import { usePageContext } from '@panpilot/react';
import { collectActions } from './tools';

/**
 * Answers the built-in `read_current_page` tool with the page's data plus every
 * PanPilot-addressable element currently on screen (ids for click_element etc.).
 */
export function useOrbitPageContext(pageId: string, title: string, getData: () => Record<string, unknown> = () => ({})) {
  usePageContext(() => ({
    pageId,
    title,
    route: window.location.pathname + window.location.search,
    ...getData(),
    actions: collectActions(),
  }));
}
