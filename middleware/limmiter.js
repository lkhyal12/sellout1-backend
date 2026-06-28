const map = {};

export async function lmmiter(req, res, next) {
  const key = req.ip + "-" + req.url;
  if (!map[key]) map[key] = [];
  map[key] = map[key].filter((el) => el + 5 * 60 * 1000 > Date.now());
  if (map[key].length >= 10)
    return res.status(429).json({ message: "Too many requests" });
  map[key].push(Date.now());
  next();
}
