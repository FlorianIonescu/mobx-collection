export default function getByPath(obj: any, path: string) {
  const result = path
    .split(".")
    .reduce(
      (acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined),
      obj
    )

  if (typeof result === "undefined") {
    throw Error(`Couldn't load path ${path} on obj ${obj.constructor.name}`)
  }

  return result
}
