/**
 * Centralized dayjs configuration.
 *
 * All plugins and locales are registered once here.
 * Import dayjs from this module instead of 'dayjs' directly
 * to ensure consistent configuration across the app.
 */

import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'

import 'dayjs/locale/en'
import 'dayjs/locale/ru'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

export { default as dayjs, default } from 'dayjs'
