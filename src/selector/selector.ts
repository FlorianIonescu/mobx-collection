export default abstract class Selector<ItemType, Groups> {
  abstract select(item: ItemType): Groups
}
