/**
 * Attaches `req.portal` ('admin' | 'pcb' | 'real_estate') so shared
 * controllers can log the correct audit_trial.panel value without each
 * portal needing its own copy of the controller - mirrors how the legacy
 * PHP set $usertype from $_SESSION['user_type'] per portal.
 */
export function portalTag(portal) {
  return (req, res, next) => {
    req.portal = portal;
    next();
  };
}
