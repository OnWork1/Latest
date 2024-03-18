export default defineEventHandler((event) => {
  console.log('ENV NODE_OPTIONS: ', process.env.NODE_OPTIONS);
});
