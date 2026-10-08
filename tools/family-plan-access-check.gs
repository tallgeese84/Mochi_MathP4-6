/* Editor-only companion to family relay 1.2.0. No web handlers or writes.
 * Add this as a separate .gs file, save, then run checkSiblingPlanAccess.
 * Distinguishes successful empty-plan reads from missing configuration/access.
 * Logs no secrets, document IDs, plan contents or learner records.
 */
function checkSiblingPlanAccess() {
  var props = PropertiesService.getScriptProperties();
  var result = {check:'saved-source-only', deploymentVerified:false, plans:{}};
  ['Hana', 'Jonah'].forEach(function(child) {
    var configured = !!props.getProperty(child.toUpperCase() + '_NIGHTLY_PLAN_DOC_ID');
    var response = JSON.parse(readSiblingPlan_(props, child).getContent());
    result.plans[child] = {
      configured: configured,
      readOk: response.ok === true,
      state: response.ok === true ? (response.plan === null ? 'empty' : 'available') : 'unavailable'
    };
  });
  console.log(JSON.stringify(result, null, 2));
  return result;
}
