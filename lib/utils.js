import jwt from "jsonwebtoken";

export function generateTokens(user) {
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );
  return { accessToken, refreshToken };
}

export function logError(funName, err) {
  console.log(`error in the ${funName} ${err}`);
}

export function userObj(user) {
  return {
    name: user.name,
    role: user.role,
    email: user.email,
    userId: user._id,
    cart: user.cart,
  };
}
