export const createStep = (
  name = 'default',
  order = '0',
): { name: string, order: string } => ({
  name,
  order,
})
