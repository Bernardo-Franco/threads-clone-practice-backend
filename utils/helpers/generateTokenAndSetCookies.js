import jwt from 'jsonwebtoken';
const generateTokenAndSetCookies = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '10d',
  });
  res.cookie('jwt', token, {
    httpOnly: true, //this makes that the cookie can't be modified with js from the browser
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: 'strict', //CSRF
  });
  return token;
};

export { generateTokenAndSetCookies };
