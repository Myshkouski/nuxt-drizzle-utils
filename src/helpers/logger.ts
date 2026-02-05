import { colorize } from 'consola/utils'

function accentColor(text: string | number | boolean) {
  return colorize('bold', colorize('greenBright', text.toString()))
}

export function accent(strings: TemplateStringsArray, ...values: (string | number | boolean)[]) {
  let result = ''
  for (let i = 0; i < strings.length; i++) {
    result += strings[i]
    if (i < values.length) {
      const value = accentColor(String(values[i]))
      result += value
    }
  }
  return result
}
