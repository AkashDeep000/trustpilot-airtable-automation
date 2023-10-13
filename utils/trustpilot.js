import { TrustpilotApi } from "trustpilot";
import "dotenv/config";

const client = await new TrustpilotApi({
  key: process.env.TRUSTPILOT_KEY,
  secret: process.env.TRUSTPILOT_SECRET,
  grantType: "client_credentials",
  baseUrl: "https://api.trustpilot.com",
}).authenticate();

export default client;
