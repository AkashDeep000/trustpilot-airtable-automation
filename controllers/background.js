import airtable from "../utils/airtable.js";
import trustpilot from "../utils/trustpilot.js";
import "dotenv/config";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const statuses = {
  received: "Received",
  pending_reviewer: "Find Reviewer - pending",
  reviewer_no_ans: "Find reviewer - no answer",
  reviewer_response: "Find reviewer - customer responded",
  waiting_on_customer: "Waiting on customer",
  review_deleted: "Review deleted",
  review_updated: "Review updated",
  resolved: "Resolved",
  testing_bad_review: "Bad review status",
  good_review: "No contact needed",
  flaged: "Flagged - not genuine",
};

const log = (info) => console.log(`Background Task: ${info}`);
const delay = (process.env.DELAY || 1) * 60 * 60 * 1000;

const backgroundHandler = async () => {
  try {
    log(`Fetching review with ${statuses.pending_reviewer} status`);
    const pendingContactReviews = await airtable("Table 1")
      .select({
        // fields: ['uID','name','status'],
        filterByFormula: `Status = "${statuses.pending_reviewer}"`,
      })
      .all();

    log(
      `Got ${pendingContactReviews.length} reviews with ${statuses.pending_reviewer} status`
    );

    for (let i = 0; i < pendingContactReviews.length; i++) {
      let review;
      try {
        log(
          `Fetching private review for review_id ${pendingContactReviews[i].fields.review_id}`
        );
        review = await trustpilot.get(
          "/v1/private/reviews/" + pendingContactReviews[i].fields.review_id
        );
      } catch (error) {
        console.log(error);
        log("Failed to fetch private review from Trustpilot API");
      }
      let email;
      review.findReviewer.requests.forEach((request) => {
        email = request.consumerResponse?.email || email;
      });
      if (!email) {
        log(
          `Cann't get email address for review_id ${pendingContactReviews[i].fields.review_id}`
        );
      } else {
        log(
          `Got email address for review_id ${pendingContactReviews[i].fields.review_id}`
        );
        try {
          await airtable("Table 1").update([
            {
              id: pendingContactReviews[i].id,
              fields: {
                Email: email,
                Status: statuses.reviewer_response,
              },
            },
          ]);
          log(
            `Added email address and updated status on Airtable for review_id ${pendingContactReviews[i].fields.review_id}`
          );
        } catch (error) {
          console.log(error);
          log("Failed to update review on Airtable");
        }
      }
      const delayPerRequestCalculated = delay / pendingContactReviews.length;
      const delayPerRequest =
        delayPerRequestCalculated < 5000 ? delayPerRequestCalculated : 5000;

      log(
        `Waiting for ${delayPerRequest / 1000} seconds before next API request`
      );
      await sleep(delayPerRequest);

      if (i === pendingContactReviews.length - 1) {
        log(`All API requests completed`);
        log(
          `Waiting for ${
            (delay - delayPerRequest * pendingContactReviews.length) /
            (1000 * 60)
          } minutes before next Background Job`
        );
        await sleep(delay - delayPerRequest * pendingContactReviews.length);
      }
    }
    if (pendingContactReviews.length === 0) {
      log(
        `Waiting for ${delay / (1000 * 60)} minutes before next Background Job`
      );
      await sleep(delay);
    }
    backgroundHandler();
  } catch (error) {
    console.log(error);
    backgroundHandler();
  }
};

export default backgroundHandler;
