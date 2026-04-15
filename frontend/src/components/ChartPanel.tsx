import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts'

type ChartType = 'pie' | 'bar' | 'line'

const COLORS = [
  '#0f766e',
  '#0284c7',
  '#a855f7',
  '#f97316',
  '#e11d48',
  '#14b8a6',
  '#facc15',
  '#0ea5e9',
]

interface Props {
  results: Record<string, unknown>[]
  chartType: ChartType
}

interface ChartDatum {
  name: string
  value: number
}

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : NaN
  }
  return NaN
}

const isNumeric = (value: unknown): boolean => !Number.isNaN(toNumber(value))

const scoreKey = (key: string, weights: Record<string, number>) => {
  const normalized = key.toLowerCase()
  return Object.entries(weights).reduce((score, [term, weight]) => {
    return normalized.includes(term) ? score + weight : score
  }, 0)
}

const chooseKey = (
  keys: string[],
  results: Record<string, unknown>[],
  weights: Record<string, number>,
): string | undefined => {
  return keys
    .slice()
    .sort((a, b) => scoreKey(b, weights) - scoreKey(a, weights))
    .find((key) => results.some((row) => row[key] !== undefined && row[key] !== null))
}

const getChartData = (results: Record<string, unknown>[], chartType: ChartType): {
  data: ChartDatum[]
  nameKey: string
  valueKey: string
} | null => {
  if (!results.length) return null

  const columns = Object.keys(results[0])
  const numericKeys = columns.filter((key) => results.some((row) => isNumeric(row[key])))
  const stringKeys = columns.filter((key) => results.some((row) => typeof row[key] === 'string'))

  const bestValueKey = chooseKey(numericKeys, results, {
    revenue: 10,
    total: 8,
    amount: 7,
    price: 6,
    count: 5,
    value: 4,
    score: 3,
    sum: 2,
    avg: 1,
  })

  const bestNameKey = chooseKey(stringKeys, results, {
    category: 10,
    state: 9,
    city: 8,
    seller: 7,
    product: 6,
    status: 5,
    month: 4,
    year: 3,
    date: 2,
    order: 1,
  })

  if (!bestValueKey) return null

  const nameKey =
    chartType === 'line'
      ?
          chooseKey(stringKeys, results, {
            month: 10,
            date: 9,
            year: 8,
            time: 7,
            order: 5,
            category: 2,
          }) || bestNameKey
      : bestNameKey

  if (!nameKey) return null
  if (nameKey === bestValueKey) return null

  const data = results
    .map((row, index) => {
      const rawName = row[nameKey]
      const rawValue = row[bestValueKey]
      const value = toNumber(rawValue)
      if (Number.isNaN(value)) return null
      const name = rawName === null || rawName === undefined ? `Row ${index + 1}` : String(rawName)
      return { name, value }
    })
    .filter((item): item is ChartDatum => item !== null)

  if (!data.length) return null

  return { data, nameKey, valueKey: bestValueKey }
}

export default function ChartPanel({ results, chartType }: Props) {
  const chart = getChartData(results, chartType)
  if (!chart) {
    return (
      <div style={{
        padding: '14px 18px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
      }}>
        Chart data not available for this result set.
      </div>
    )
  }

  return (
    <div style={{
      height: '320px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
    }}>
      <div style={{
        marginBottom: '12px',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: 'var(--text-secondary)',
      }}>
        Chart: {chartType.toUpperCase()} — {chart.nameKey} vs {chart.valueKey}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'pie' ? (
          <PieChart>
            <Pie data={chart.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {chart.data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : chartType === 'bar' ? (
          <BarChart data={chart.data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
            <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#14b8a6" />
          </BarChart>
        ) : (
          <LineChart data={chart.data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
            <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}


export type { ChartType }
