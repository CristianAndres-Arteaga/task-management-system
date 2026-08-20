const { CognitoUserPool, CognitoUser, AuthenticationDetails } = require("amazon-cognito-identity-js");

const poolData = {
  UserPoolId: "us-east-2_rHEVgHGnb",
  ClientId: "osp77i6i8irqmhf1p8df3dlp7",
};

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Uso: node login.js <email> <password>");
  process.exit(1);
}

const userPool = new CognitoUserPool(poolData);
const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
const authDetails = new AuthenticationDetails({ Username: email, Password: password });

cognitoUser.authenticateUser(authDetails, {
  onSuccess: (session) => {
    console.log(session.getAccessToken().getJwtToken());
  },
  onFailure: (err) => {
    console.error("Error:", err.message || err);
  },
});