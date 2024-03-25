const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const { StatusCodes } = require('http-status-codes');
const CustomErrors = require('../utils/customErrors.js');
const expressHandlebars = require('nodemailer-express-handlebars');
const path = require('path');

const OAuth2 = google.auth.OAuth2;

const isTokenExpired = (token) => {
  let currentTimestamps = Math.floor(Date.now() / 10000);
  return currentTimestamps > token.expire_date;
};

const refreshAccessToken = async (oauth) => {
  try {
    const { tokens } = await oauth.refreshAccessTOken();
    oauth.setCredential(tokens);
    return tokens.access_token;
  } catch (error) {
    throw new CustomErrors.UnAuthorized(
      StatusCodes.UNAUTHORIZED,
      `Error ocurred while refreshing access token: ${error}`
    );
  }
};

const createTransporter = async () => {
  const OAuth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  OAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  OAuth2Client.generateAuthUrl({
    scope: process.env.SCOPES,
    include_granted_scopes: true,
  });
  const accessToken = await OAuth2Client.getAccessToken();

  if (isTokenExpired(OAuth2Client.credentials)) {
    const refreshedAccessToken = await refreshAccessToken(OAuth2Client);

    if (refreshAccessToken) {
      OAuth2Client.setCredentials({
        access_token: refreshedAccessToken,
        refresh_token: process.env.REFRESH_TOKEN,
        scope: process.env.SCOPES,
        token_type: process.env.TOKEN_TYPE,
        expiry_date: OAuth2Client.credentials.expiry_date,
      });
    } else {
      console.error('Failed to refresh access token');
      return null;
    }
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      pass: process.env.EMAIL_HOST_PASSWORD,
      accessToken: accessToken,
      refreshToken: process.env.REFRESH_TOKEN,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      pass: process.env.EMAIL_HOST_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // This line bypasses SSL certificate verification
    },
  });
};

const sendMail = async (email, subject, payload, template) => {
  try {
    const transporter = await createTransporter();

    transporter.use(
      'compile',
      expressHandlebars({
        viewEngine: {
          extName: '.hbs',
          partialsDir: path.resolve(__dirname, '../views/partials/'),
          layoutsDir: path.resolve(__dirname, '../views/layouts/'),
          defaultLayout: 'layout',
        },
        extName: '.hbs',
        viewPath: path.resolve(__dirname, '../views/partials/'),
      })
    );

    const options = () => {
      return {
        from: process.env.EMAIL,
        to: email,
        subject,
        template: template,
        context: payload,
      };
    };

    const info = await transporter.sendMail(options());
    console.log('Message Id : %s' + info.messageId);
  } catch (error) {
    throw error;
  }
};

module.exports = { sendMail };
