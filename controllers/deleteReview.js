import airtable from "../utils/airtable.js";
import trustpilot from "../utils/trustpilot.js";

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
  flaged: "Flagged - not genuine"
};

const deleteReviewHandler = async (event, site) => {
  try {
    const previousReview = await airtable("Table 1")
      .select({
        // fields: ['uID','name','status'],
        filterByFormula: `{review_id} = "${event.id}"`,
      })
      .all();
    if (!previousReview[0]) return;

    await airtable("Table 1").update([
      {
        id: previousReview[0].id,
        fields: {
          "Date/Time deleted": new Date(),
          Status: statuses.review_deleted,
        },
      },
    ]);
  } catch (error) {
    throw Error(error);
  }
};

export default deleteReviewHandler;
