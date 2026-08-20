import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import type { CognitoUserSession } from "amazon-cognito-identity-js";
import type { SignUpData, LoginData, AuthUser } from "../types/auth";

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
};

export const userPool = new CognitoUserPool(poolData);

export function signUp(data: SignUpData): Promise<void> {
  const attributeList = [
    new CognitoUserAttribute({
      Name: "email",
      Value: data.email,
    }),
  ];

  return new Promise((resolve, reject) => {
    userPool.signUp(
      data.email,
      data.password,
      attributeList,
      [],
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
}

export function confirmSignUp(email: string, code: string): Promise<void> {
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export function login(data: LoginData): Promise<AuthUser> {
  const authenticationDetails = new AuthenticationDetails({
    Username: data.email,
    Password: data.password,
  });

  const cognitoUser = new CognitoUser({
    Username: data.email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        const payload = session.getIdToken().payload;
        resolve({
          sub: payload.sub,
          email: payload.email,
        });
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

export function logout(): void {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
}

export function getAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error("No hay un usuario autenticado"));
      return;
    }

    cognitoUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          reject(err ?? new Error("La sesión no es válida"));
          return;
        }
        resolve(session.getAccessToken().getJwtToken());
      }
    );
  });
}