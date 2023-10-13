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

const sendContactRequest = async (id) => {
  try {
    const res = await trustpilot.post(
      `/v1/private/reviews/${id}/find-reviewer`,
      {
        message: "[replit] - Find Reviewer request created",
        skipNotificationEmailToBusinessUser: false,
      }
    );
    if (!res.isSuccessStatusCode) {
      throw new Error("Failed to create find reviewer request.");
    }
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
          "Date/Time requested": new Date(),
          Status: statuses.pending_reviewer,
        },
      },
    ]);
  } catch (error) {
    throw Error(error);
  }
};
export default sendContactRequest;
