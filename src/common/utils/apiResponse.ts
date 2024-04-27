export const successResponse = <T>(data: T) => ({
  status: 'success',
  data,
});
