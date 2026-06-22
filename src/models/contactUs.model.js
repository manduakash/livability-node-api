import { db } from "../db/index.js";
import { contactUs } from "../db/schema.js";

/**
 * Only an INSERT exists for this table in the legacy query set (a public
 * "Contact Us" form on the real_estate portal's public-facing pages) - no
 * listing/edit/delete was found, so this model is intentionally
 * write-only for now. Add a `list()`/`getById()` later if an admin
 * "view submissions" page is migrated.
 */
export const ContactUsModel = {
  async create({ fname, lname, email, phone, state, district, city, pinNo, profile, docPath, realEstateId }) {
    const [result] = await db.insert(contactUs).values({
      fname,
      lname,
      email,
      phone,
      state,
      district,
      city,
      pinNo,
      profile,
      docPath,
      realEstateId,
    });
    return result.insertId;
  },
};
