/**
 * VERIFIED data from Social Performance Tracker (2026).xlsx
 * Sheets: IG, FB, TT — covering Jan→Apr 2026 + full 2025 baseline.
 *
 * Every number here is traceable to the spreadsheet. Nothing is fabricated.
 * If a cell is blank in the Excel, it's `null` here (not zero).
 *
 * Source of truth: ~/Downloads/Social Performance Tracker (2026).xlsx
 * Verified: 2026-05-27
 */

export type MonthlyRow = {
  month: 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec'
  value: number | null
}

export type PlatformMonthly = {
  platform: 'instagram' | 'facebook' | 'tiktok'
  metric: string
  unit: string
  y2026: (number | null)[]   // Jan..Dec
  y2025: (number | null)[]
}

const M = (...vals: (number | null)[]): (number | null)[] => {
  const padded = [...vals]
  while (padded.length < 12) padded.push(null)
  return padded
}

// ─── INSTAGRAM (verified from XLSX 'IG' sheet) ────────────────────────────────
export const INSTAGRAM_2026: Record<string, (number | null)[]> = {
  accounts_reached: M(2753754, 2080664, 1626707, 1664455),
  total_views:      M(6083475, 5621747, 3603150, 4239995),
  likes:            M(65257, 80721, 26641, 38118),
  comments:         M(1397, 758, 352, 298),
  shares:           M(18733, 31278, 4886, 5254),
  saves:            M(18117, 10587, 6757, 11624),
  new_follows:      M(4623, 5816, 12954, 12511),
  sessions:         M(1798, 1646, 869, 1214),
  free_trials:      M(210, 188, 106, 150),
  ftcr:             M(0.1168, 0.1142, 0.1220, 0.1236),
  revenue_ga4:      M(813.95, 352.00, 1197.55, 980.97),
  shopify_revenue:  M(509.95, 45.00, 489.96, 233.99),
  ig_bonus:         M(51.84, 90.26, 43.23, 19.99),
}
export const INSTAGRAM_2025: Record<string, (number | null)[]> = {
  accounts_reached: M(1622900, 3135955, 1755259, 1300888, 6617246, 7725002, 3337621, 6163182, 1484143, 1533247, 773999, 738524),
  likes:            M(103022, 197723, 136757, 77499, 74714, 80548, 168435, 107674, 127609, 96187, 74015, 67097),
  comments:         M(1419, 2170, 1440, 675, 19412, 1008, 1146, 474, 3645, 1390, 787, 1773),
  shares:           M(16627, 44534, 36792, 19543, 21049, 30022, 40252, 21879, 35104, 29344, 11058, 14515),
  saves:            M(17965, 17414, 36792, 12745, 13674, 11821, 28097, 26333, 21101, 18678, 7645, 10004),
  new_follows:      M(2561, 7116, 5625, 5744, 3180, 2040, 2687, 1716, 1678, 1278, 842, 548),
  sessions:         M(1660, 2529, 1682, 3084, 3679, 2464, 2555, 1754, 2698, 1615, 1523, 1764),
  free_trials:      M(47, 42, 31, 87, 166, 122),
  ftcr:             M(0.0283, 0.0166, 0.0184, 0.0282, 0.0451, 0.0500),
  revenue_ga4:      M(3503.84, 6777.88, 1377.46, 2747.91, 4736.91, 2040.89),
  shopify_revenue:  M(1839.87, 1759.88, 439.97, 1199.90, 1499.90, 1743.78),
}

// ─── FACEBOOK (verified from XLSX 'FB' sheet) ─────────────────────────────────
export const FACEBOOK_2026: Record<string, (number | null)[]> = {
  views:               M(12816129, 7760649, 12580793, 7074880),
  accounts_reached:    M(4052049, 2632548, 4892622, 1940977),
  facebook_visits:     M(43911, 24789, 13623, 19109),
  content_interactions:M(66020, 33740, 14733, 19918),
  new_follows:         M(16371, 7810, 3789, 4090),
  free_trials:         M(142, 84, 47, 55),
  sessions_ga4:        M(3789, 2511, 2552, 1689),
  ftcr:                M(0.0375, 0.0335, 0.0184, 0.0326),
  revenue_ga4:         M(720.49, 451.99, 88.99, 0),
}
export const FACEBOOK_2025: Record<string, (number | null)[]> = {
  accounts_reached:    M(1782871, 1599554, 1589045, 1592186, 1001136, 1513111, 5405765, 2122668, 1160466, 6401826, 2162589, 2281516),
  facebook_visits:     M(70494, 64037, 45827, 35324, 28555, 36088, 47658, 48509, 35914, 51781, 50814, 44003),
  content_interactions:M(99827, 91001, 80374, 56818, 48352, 66551, 126219, 77550, 47062, 87155, 76450, 110060),
  new_follows:         M(23875, 20690, 14265, 10698, 8252, 12330, 17514, 19873, 10849, 23787, 18867, 18133),
  free_trials:         M(31, 22, 52, 99, 166, 117, 156, 120, 81, 94, 44, 56),
  sessions_ga4:        M(1053, 1006, 1848, 2962, 2773, 2100, 2503, 2555, 2295, 2079, 1728, 1654),
  ftcr:                M(0.0294, 0.0219, 0.0281, 0.0334, 0.0599, 0.0557, 0.0623, 0.0470, 0.0353, 0.0452, 0.0255, 0.0339),
}

// ─── TIKTOK (verified from XLSX 'TT' sheet) ───────────────────────────────────
export const TIKTOK_2026: Record<string, (number | null)[]> = {
  views:             M(16057347, 17222661, 12398586, 12296014),
  reached_audience:  M(15364361, 16028127, 11863501, 11791676),
  profile_views:     M(60884, 101574, 63000, 86918),
  engaged_audience:  M(231399, 585200, 276796, 278521),
  saves:             M(10988, 5234, 4586, 11764),
  likes:             M(142213, 214278, 107071, 178819),
  comments:          M(2186, 2868, 218, 1369),
  shares:            M(16368, 26545, 12682, 3639),
  new_follows:       M(14263, 24814, 13120, 15323),
  num_posts:         M(53, 40, 48, 48),
  sessions_ga4:      M(1775, 3024, 1396, 2644),
  free_trials:       M(199, 464, 82, 52),
  ftcr:              M(0.1121, 0.1534, 0.0587, 0.0197),
  revenue_ga4:       M(1620.85, 1242.42, 1064.52, 280.80),
  revenue_total_ds:  M(8872.48, 11982.70, 8941.20, 5698.30, 7225.10, 6282.10),
  shopify_revenue:   M(1409.84, 661.36, 359.96, 179.99),
}
export const TIKTOK_2025: Record<string, (number | null)[]> = {
  views:             M(5391309, 7492585, 7944426, 5348693, 6990813, 10793871, 9849832, 1281073, 5800746, 8515246, 8020040, 5960751),
  reached_audience:  M(4895771, 7031867, 7393025, 4836608, 6475297, 10243424, 9244253, 1162674, 5259381, 7987959, 7502827, 5540401),
  profile_views:     M(64193, 73296, 89524, 61636, 116086, 92033, 90848, 13762, 62318, 73324, 61071, 44929),
  likes:             M(212670, 369600, 470263, 159412, 304348, 502882, 431465, 36084, 152868, 217365, 191239, 145310),
  comments:          M(4958, 13483, 48478, 5500, 7325, 7812, 9978, 710, 4173, 2765, 2501, 2321),
  shares:            M(20381, 36217, 79385, 20853, 25511, 51486, 44029, 5075, 21871, 18104, 14188, 11264),
  new_follows:       M(11369, 14618, 28623, 14954, 20706, 10572, 12825, 3443, 11087, 10144, 6054, 2662),
  num_posts:         M(52, 52, 52, 57, 44, 43, 50, 46, 50, 55, 47, 45),
  sessions_ga4:      M(3310, 2770, 2515, 1386, 2237, 2255),
  free_trials:       M(91, 75, 53, 79, 154, 183),
  ftcr:              M(0.0275, 0.0271, 0.0211, 0.0570, 0.0688, 0.0812),
  revenue_ga4:       M(6602.69, 5180.83, 2226.92, 1526.90, 2857.96, 1958.96),
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Most recent verified month (last non-null index across IG views)
export function latestMonth(metric: (number | null)[]): { month: string; value: number; index: number } | null {
  for (let i = 11; i >= 0; i--) {
    if (metric[i] != null) return { month: MONTHS[i], value: metric[i] as number, index: i }
  }
  return null
}

export const VERIFIED_SOURCE = {
  file: 'Social Performance Tracker (2026).xlsx',
  verified_at: '2026-05-27',
  coverage: 'Jan-Apr 2026, all 12 months 2025',
}
