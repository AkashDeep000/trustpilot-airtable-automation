import express from "express";
import newReview from "./controllers/newReview.js";
import updateReview from "./controllers/updateReview.js";
import deleteReview from "./controllers/deleteReview.js";
import sendContactRequest from "./controllers/sendContactRequest.js";
import backgroundHandler from "./controllers/background.js";
import addTrustscore from "./controllers/addTrustscore.js";
import cron from "node-cron";

const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/webhook/:site", async (req, res) => {
  const { site } = req.params;
  if (!site) {
    res.status(400).send("No site Provided");
  }

  if (req.body?.events?.length === 0) {
    res.status(400).send("No Event Passed");
  }

  const events = req.body.events;
  console.log(events);

  try {
    for (let i = 0; i < events.length; i++) {
      if (events[i].eventName === "service-review-created") {
        console.log("Got New Review Webhook Notification");
        await newReview(events[i].eventData, site);
      }
      if (events[i].eventName === "service-review-updated") {
        console.log("Got Update Webhook Notification");
        await updateReview(events[i].eventData, site);
      }
      if (events[i].eventName === "service-review-deleted") {
        console.log("Got Delete Webhook Notification");
        await deleteReview(events[i].eventData, site);
      }
    }

    res.send("Succcess");
  } catch (error) {
    console.log(error);
  }
});

app.get("/reviewer/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send("No Reviewer ID Provided");
  }
  try {
    await sendContactRequest(id);
    res.send(
      `<h3>Successfully send contact details request for this <a href="https://businessapp.b2b.trustpilot.com/reviews/${id}">review</a><h2/>`
    );
  } catch (e) {
    console.log(e);
    res.send(
      `<h3>Failed send contact details request for this <a href="https://businessapp.b2b.trustpilot.com/reviews/${id}">review</a><h2/>`
    );
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

backgroundHandler();
cron.schedule("0 0 * * *", async () => {
  await addTrustscore();
});
