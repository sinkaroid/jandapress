export const logger = {
  info(payload: unknown) {
    console.log(payload);
  },
  error(payload: unknown) {
    console.error(payload);
  }
};