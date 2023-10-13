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

const newReviewHandler = async (event, site) => {
  try {
    let review;
    try {
      review = await trustpilot.get("/v1/private/reviews/" + event.id);
      
    } catch (error) {
      console.log(error);
    }
    await airtable("Table 1").create([
      {
        fields: {
          customer_name: event.consumer.name,
          is_verified: event.isVerified,
          review_id: event.id,
          stars: event.stars,
          Site: site,
          title: event.title,
          text: event.text,
          language: event.language,
          created_date: event.createdAt,
          "Reviewer URL":
            "https://www.trustpilot.com/users/" + event.consumer.id,
          "Review URL":
            "https://businessapp.b2b.trustpilot.com/reviews/" + event.id,
          order_no: event.referenceId,
          Status: event.stars >= 4 ? statuses.good_review : statuses.received,
          Source: review?.source,
          Email: review?.referralEmail,
        },
      },
    ]);
  } catch (error) {
    throw Error(error);
  }
};

export default newReviewHandler;
