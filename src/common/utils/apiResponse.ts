export const successResponse = <T>({
  data,
  message,
}: {
  data?: T;
  message?: string;
}) => ({
  status: 'success',
  ...(message && { message }),
  ...(data && { data }),
});
