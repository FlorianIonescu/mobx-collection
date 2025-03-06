export default function tryGetByPath(obj: any, path: string) {
  const result = path
    .split(".")
    .reduce(
      (acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined),
      obj
    )

  return result
}
