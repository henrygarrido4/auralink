import ArrowRight from '../assets/icons/arrow-right.svg';
import CodeXml from '../assets/icons/code-xml.svg';
import FilePenLine from '../assets/icons/file-pen-line.svg';
import MailClock from '../assets/icons/mail-clock.svg';
import Search from '../assets/icons/search.svg';
import ShoppingBag from '../assets/icons/shopping-bag.svg';
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
  'code-xml': CodeXml,
  'file-pen-line': FilePenLine,
  'mail-clock': MailClock,
  search: Search,
  'shopping-bag': ShoppingBag,
  sparkles: Sparkles,
};

export type IconName = keyof typeof icons;
