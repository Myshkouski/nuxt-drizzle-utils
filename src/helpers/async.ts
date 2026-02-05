async function* generateAsync<T, U>(iterable: Iterable<T>, cb: (value: T, index: number) => Promise<U>) {
  let index = 0
  for (const value of iterable) {
    yield await cb(value, index++)
  }
}

export async function mapAsync<T, U>(iterable: Iterable<T>, cb: (value: T, index: number) => Promise<U>) {
  const generator = generateAsync(iterable, cb)
  const items: U[] = []
  for await (const item of generator) {
    items.push(item)
  }
  return items
}

export async function runParallel<
  Tasks extends ReadonlyArray<() => any>,
>(...tasks: Tasks) {
  return await Promise.all(tasks)
}
