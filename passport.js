const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

//Used for Extracting the JWt token from the header
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      console.log("jwtPayload ", jwtPayload);
      const user = await prisma.user.findUnique({
        where: { id: jwtPayload.userId },
      });

      // the done callback is a function that is used to communicate the outcome of the authentication process
      // to the Passport framework. It's a standard callback pattern that follows the Node.js convention of (error, result).
      // The done callback is typically used within authentication strategy callback functions to indicate whether
      // authentication was successful, unsuccessful, or encountered an error.
      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

const authenticate = passport.authenticate("jwt", { session: false });

const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid login credentials");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error("Invalid login credentials");
  }

  const token = jwt.sign({ userId: user?.id }, process.env.SECRET_KEY);

  return { token, user };
};

module.exports = { authenticate, login };
