import { response } from "../utils/response.js";
import { ContactUsModel } from "../models/contactUs.model.js";
import { FeedBackRealModel } from "../models/feedBackReal.model.js";

/**
 * POST /api/public/contact-us
 * Replaces the public "Contact Us" form submit handler.
 */
export async function submitContactUs(req, res) {
  try {
    const { fname, lname, email, phone, state, district, city, pinNo, profile, docPath, realEstateId } =
      req.body;

    if (!fname || !lname || !email || !phone) {
      return response.error(res, "fname, lname, email, and phone are required", 400);
    }

    const id = await ContactUsModel.create({
      fname,
      lname,
      email,
      phone,
      state: state || "",
      district: district || "",
      city: city || "",
      pinNo: pinNo || "",
      profile: profile || "",
      docPath: docPath || "",
      realEstateId: Number(realEstateId) || 0,
    });

    return response.success(res, "Contact request submitted", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to submit contact request: ${err.message}`);
  }
}

/**
 * POST /api/public/feedback
 * Replaces the resident feedback form submit handler on the real_estate portal.
 */
export async function submitFeedback(req, res) {
  try {
    const { feed, rating1, rating2, rating3, rating4, rating5, rating6, list, comm, realEstateId } =
      req.body;

    if (!realEstateId) {
      return response.error(res, "realEstateId is required", 400);
    }

    const id = await FeedBackRealModel.create({
      feed: feed ?? "",
      rating1: rating1 ?? "",
      rating2: rating2 ?? "",
      rating3: rating3 ?? "",
      rating4: rating4 ?? "",
      rating5: rating5 ?? "",
      rating6: rating6 ?? "",
      list: list ?? "",
      comm: comm ?? "",
      realEstateId: Number(realEstateId),
    });

    return response.success(res, "Feedback submitted", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to submit feedback: ${err.message}`);
  }
}
