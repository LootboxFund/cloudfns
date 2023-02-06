export class NoAffiliateError extends Error {
  userID: string;
  constructor(message: string, userID: string) {
    super(message);
    this.name = "NoAffiliateError";
    this.userID = userID;
  }
}
