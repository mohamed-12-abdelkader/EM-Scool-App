import { Platform } from 'react-native';

const NAV_OFFSET = 84;

function getScrollParent(node: Element | null): Element {
  let el = node?.parentElement ?? null;
  while (el && el !== document.body && el !== document.documentElement) {
    const { overflowY } = window.getComputedStyle(el);
    const canScroll =
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      el.scrollHeight > el.clientHeight + 2;
    if (canScroll) return el;
    el = el.parentElement;
  }
  return (document.scrollingElement || document.documentElement) as Element;
}

function findSection(id: string): Element | null {
  return (
    document.getElementById(id) ||
    document.querySelector(`[data-landing-section="${id}"]`) ||
    document.querySelector(`[id="${id}"]`)
  );
}

function scrollContainerTo(scroller: Element, top: number) {
  const y = Math.max(0, top);
  if (scroller === document.documentElement || scroller === document.body || scroller === document.scrollingElement) {
    window.scrollTo({ top: y, behavior: 'smooth' });
    return;
  }
  if (typeof (scroller as HTMLElement).scrollTo === 'function') {
    (scroller as HTMLElement).scrollTo({ top: y, behavior: 'smooth' });
  } else {
    (scroller as HTMLElement).scrollTop = y;
  }
}

/** Smooth-scroll landing navbar targets (web). */
export function scrollToSection(id: string) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  if (!id || id === 'top') {
    const scroller = getScrollParent(document.body);
    scrollContainerTo(scroller, 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const el = findSection(id);
  if (!el) return;

  const scroller = getScrollParent(el);
  const elRect = el.getBoundingClientRect();

  if (
    scroller === document.documentElement ||
    scroller === document.body ||
    scroller === document.scrollingElement
  ) {
    scrollContainerTo(scroller, window.scrollY + elRect.top - NAV_OFFSET);
    return;
  }

  const sRect = scroller.getBoundingClientRect();
  scrollContainerTo(scroller, (scroller as HTMLElement).scrollTop + (elRect.top - sRect.top) - NAV_OFFSET);
}
