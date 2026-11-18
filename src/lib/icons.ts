import ArrowRight from '../assets/icons/arrow-right.svg';
import ArrowUpRight from '../assets/icons/arrow-up-right.svg';
import CalendarCheck from '../assets/icons/calendar-check.svg';
import CodeXml from '../assets/icons/code-xml.svg';
import FilePenLine from '../assets/icons/file-pen-line.svg';
import Globe from '../assets/icons/globe.svg';
import KeyRound from '../assets/icons/key-round.svg';
import LayoutGrid from '../assets/icons/layout-grid.svg';
import ListFilter from '../assets/icons/list-filter.svg';
import Lock from '../assets/icons/lock.svg';
import MailClock from '../assets/icons/mail-clock.svg';
import Search from '../assets/icons/search.svg';
import ShoppingBag from '../assets/icons/shopping-bag.svg';
import SlidersHorizontal from '../assets/icons/sliders-horizontal.svg';
import Sparkle from '../assets/icons/sparkle.svg';
import Sparkles from '../assets/icons/sparkles.svg';

/**
 * The site's icon set, by name. Every icon is from Lucide (https://lucide.dev), copied unchanged
 * from the lucide-static package into src/assets/icons/ and credited in src/assets/CREDITS.md.
 * One family keeps the drawing consistent: a 24px grid, 2px strokes, round caps and joins, the
 * same rules as the navbar's menu icons. Astro inlines each file as an <svg> at build time, so an
 * icon costs no JavaScript, font, or request. Render them with src/components/ui/Icon.astro.
 *
 * To add an icon, copy its file from the same Lucide release, import it here, and extend the
 * credits entry.
 */
export const icons = {
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'calendar-check': CalendarCheck,
  'code-xml': CodeXml,
  'file-pen-line': FilePenLine,
  globe: Globe,
  'key-round': KeyRound,
  'layout-grid': LayoutGrid,
  'list-filter': ListFilter,
  lock: Lock,
  'mail-clock': MailClock,
  search: Search,
  'shopping-bag': ShoppingBag,
  'sliders-horizontal': SlidersHorizontal,
  sparkle: Sparkle,
  sparkles: Sparkles,
};

export type IconName = keyof typeof icons;
