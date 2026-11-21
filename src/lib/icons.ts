import Activity from '../assets/icons/activity.svg';
import ArrowRight from '../assets/icons/arrow-right.svg';
import ArrowUpRight from '../assets/icons/arrow-up-right.svg';
import Briefcase from '../assets/icons/briefcase.svg';
import CalendarCheck from '../assets/icons/calendar-check.svg';
import Car from '../assets/icons/car.svg';
import Check from '../assets/icons/check.svg';
import ChartColumn from '../assets/icons/chart-column.svg';
import CircleAlert from '../assets/icons/circle-alert.svg';
import ClipboardList from '../assets/icons/clipboard-list.svg';
import Clock from '../assets/icons/clock.svg';
import Code from '../assets/icons/code.svg';
import CodeXml from '../assets/icons/code-xml.svg';
import Factory from '../assets/icons/factory.svg';
import FilePenLine from '../assets/icons/file-pen-line.svg';
import Globe from '../assets/icons/globe.svg';
import GraduationCap from '../assets/icons/graduation-cap.svg';
import Handshake from '../assets/icons/handshake.svg';
import HardHat from '../assets/icons/hard-hat.svg';
import HeartHandshake from '../assets/icons/heart-handshake.svg';
import House from '../assets/icons/house.svg';
import KeyRound from '../assets/icons/key-round.svg';
import LayoutGrid from '../assets/icons/layout-grid.svg';
import Leaf from '../assets/icons/leaf.svg';
import Link from '../assets/icons/link.svg';
import ListFilter from '../assets/icons/list-filter.svg';
import Lock from '../assets/icons/lock.svg';
import Mail from '../assets/icons/mail.svg';
import MailClock from '../assets/icons/mail-clock.svg';
import MapPin from '../assets/icons/map-pin.svg';
import Megaphone from '../assets/icons/megaphone.svg';
import MessageCircle from '../assets/icons/message-circle.svg';
import MessagesSquare from '../assets/icons/messages-square.svg';
import MonitorCog from '../assets/icons/monitor-cog.svg';
import MoveRight from '../assets/icons/move-right.svg';
import Palette from '../assets/icons/palette.svg';
import PawPrint from '../assets/icons/paw-print.svg';
import Phone from '../assets/icons/phone.svg';
import Repeat from '../assets/icons/repeat.svg';
import Scale from '../assets/icons/scale.svg';
import Search from '../assets/icons/search.svg';
import ShoppingBag from '../assets/icons/shopping-bag.svg';
import SlidersHorizontal from '../assets/icons/sliders-horizontal.svg';
import Sparkles from '../assets/icons/sparkles.svg';
import Target from '../assets/icons/target.svg';
import Tooth from '../assets/icons/tooth.svg';
import TrendingUp from '../assets/icons/trending-up.svg';
import UserPlus from '../assets/icons/user-plus.svg';
import Utensils from '../assets/icons/utensils.svg';
import Video from '../assets/icons/video.svg';
import Workflow from '../assets/icons/workflow.svg';

/**
 * The site's icon set, by name. Every icon but one is from Lucide (https://lucide.dev), copied
 * unchanged from the lucide-static package into src/assets/icons/ and credited in
 * src/assets/CREDITS.md. Lucide has no tooth, so `tooth` is this site's own drawing on Lucide's
 * grid, by Lucide's rules (2026-11-19). One family keeps the drawing consistent: a 24px grid, 2px
 * strokes, round caps and joins, the same rules as the navbar's menu icons. Astro inlines each
 * file as an <svg> at build time, so an icon costs no JavaScript, font, or request. Render them
 * with src/components/ui/Icon.astro.
 *
 * To add an icon, copy its file from the same Lucide release, import it here, and extend the
 * credits entry. Draw one only when Lucide has nothing for it, as the tooth was.
 */
export const icons = {
  activity: Activity,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  briefcase: Briefcase,
  'calendar-check': CalendarCheck,
  car: Car,
  check: Check,
  'chart-column': ChartColumn,
  'circle-alert': CircleAlert,
  'clipboard-list': ClipboardList,
  clock: Clock,
  code: Code,
  'code-xml': CodeXml,
  factory: Factory,
  'file-pen-line': FilePenLine,
  globe: Globe,
  'graduation-cap': GraduationCap,
  handshake: Handshake,
  'hard-hat': HardHat,
  'heart-handshake': HeartHandshake,
  house: House,
  'key-round': KeyRound,
  'layout-grid': LayoutGrid,
  leaf: Leaf,
  link: Link,
  'list-filter': ListFilter,
  lock: Lock,
  mail: Mail,
  'mail-clock': MailClock,
  'map-pin': MapPin,
  megaphone: Megaphone,
  'message-circle': MessageCircle,
  'messages-square': MessagesSquare,
  'monitor-cog': MonitorCog,
  'move-right': MoveRight,
  palette: Palette,
  'paw-print': PawPrint,
  phone: Phone,
  repeat: Repeat,
  scale: Scale,
  search: Search,
  'shopping-bag': ShoppingBag,
  'sliders-horizontal': SlidersHorizontal,
  sparkles: Sparkles,
  target: Target,
  tooth: Tooth,
  'trending-up': TrendingUp,
  'user-plus': UserPlus,
  utensils: Utensils,
  video: Video,
  workflow: Workflow,
};

export type IconName = keyof typeof icons;
