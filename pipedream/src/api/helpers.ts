export const encodeURISafe = (stringFragment: string) =>
  encodeURIComponent(stringFragment).replace(/'/g, "%27").replace(/"/g, "%22");

export const generateRandomLogo = () => {
  return "https://i.redd.it/uwau9udc0b751.png";
};
