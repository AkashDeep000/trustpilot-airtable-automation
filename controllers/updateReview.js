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

const updateReviewHandler = async (event, site) => {
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
          is_verified: event.isVerified,
          "Updated title": event.title,
          "Updated text": event.text,
          "Updated Rating": event.stars,
          "Date/Time updated": new Date(),
          order_no: event.referenceId,
          Site: site,
          Status:
            previousReview[0].fields.stars !== event.stars
              ? statuses.review_updated
              : previousReview[0].fields.Status,
        },
      },
    ]);
  } catch (error) {
    throw Error(error);
  }
};

export default updateReviewHandler;
