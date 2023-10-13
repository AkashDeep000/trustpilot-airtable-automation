import Airtable from "airtable";
import 'dotenv/config'

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey:
    process.env.AIRTABLE_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

export default base;
