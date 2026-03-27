const isExpired = (url) => {
  if (!url) return true;
  if (!url.expiresAt) return false;

  console.log(
    "current date: ",
    Date.now(),
    "Exp date: ",
    new Date(url.expiresAt).getTime(),
  );
  return Date.now() >= new Date(url.expiresAt).getTime();
};

module.exports = { isExpired };
