import airtable from "../utils/airtable.js";
import trustpilot from "../utils/trustpilot.js";


const unitIds = [
  "4a854acd000064000504718b",
  "5cc867344786990001505696",
  "5cc2e9c43deafc000159e4cd",
  "6185406e0d6c4b5501513b88",
  "5d813bb36e47c20001ee8264",
  "5e4abd2c3fe4ff0001101faa",
  "5ebd8d799a5a3e00010c4460",
  "5da0dac0468f5e00015dbd4a",
  "617905da99b0db28c16c28e7",
];
const names = [".com", "ES", "FR", "US", "DE", "AU", "NL", "SE", "TW"];

const addTrustscore = async () => {
  const record = {};
  try {
    for (let i = 0; i < unitIds.length; i++) {
      try {
        const res = await trustpilot.get(`/v1/business-units/${unitIds[i]}`);
        record[`Number of reviews (${names[i]})`] = res.numberOfReviews.total;
        record[`Trustscore (${names[i]})`] = res.score.trustScore;
      } catch (e) {
        console.log(e);
      }
    }
    console.log(`Adding Trustscore`, record);

    await airtable("Trustscore").create([
      {
        fields: {
          ...record,
          Date: JSON.parse(JSON.stringify(new Date())).split("T")[0],
        },
      },
    ]);
    console.log("Succesfully added Trustscore");
  } catch (error) {
    throw Error(error);
  }
};

export default addTrustscore;
