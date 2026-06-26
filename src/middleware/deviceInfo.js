/**
 * Replaces the legacy connection/conn.php `getBrowser()` function.
 * Parses the User-Agent header into { browser, version, platform } and
 * attaches it to req.deviceInfo so controllers/audit logging can use it
 * the same way the PHP code used $data['name'], $data['version'],
 * $data['platform'].
 */
export function deviceInfo(req, res, next) {
  const ua = req.headers["user-agent"] || "";

  let platform = "Unknown";
  if (/linux/i.test(ua)) platform = "Linux";
  else if (/macintosh|mac os x/i.test(ua)) platform = "Mac";
  else if (/windows|win32/i.test(ua)) platform = "Windows";
  else if (/android/i.test(ua)) platform = "Android";
  else if (/iphone|ipad|ios/i.test(ua)) platform = "iOS";

  let name = "Unknown";
  let ub = "other";
  if (/MSIE/i.test(ua) && !/Opera/i.test(ua)) {
    name = "Internet Explorer";
    ub = "MSIE";
  } else if (/Firefox/i.test(ua)) {
    name = "Mozilla Firefox";
    ub = "Firefox";
  } else if (/OPR/i.test(ua)) {
    name = "Opera";
    ub = "OPR";
  } else if (/Edg/i.test(ua)) {
    name = "Edge";
    ub = "Edg";
  } else if (/Chrome/i.test(ua)) {
    name = "Google Chrome";
    ub = "Chrome";
  } else if (/Safari/i.test(ua)) {
    name = "Apple Safari";
    ub = "Version";
  } else if (/Trident/i.test(ua)) {
    name = "Internet Explorer";
    ub = "MSIE";
  }

  const versionMatch = ua.match(new RegExp(`${ub}[/ ]+([0-9.]+)`, "i"));
  const version = versionMatch ? versionMatch[1] : "?";

  req.deviceInfo = {
    browser: `${name}${version}`,
    name,
    version,
    platform,
  };

  next();
}
