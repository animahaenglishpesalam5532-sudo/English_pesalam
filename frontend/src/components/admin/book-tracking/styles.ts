export const INPUT_BASE =
  'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 sm:text-sm text-gray-900 placeholder-gray-500'
export const INPUT_OK = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
export const INPUT_ERR = 'border-red-300 focus:ring-red-500'

export const FILTER_INPUT =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900'

export const CARD = 'bg-white rounded-xl shadow-sm border border-gray-100'

export function fieldClass(hasError: boolean): string {
  return `${INPUT_BASE} ${hasError ? INPUT_ERR : INPUT_OK}`
}
