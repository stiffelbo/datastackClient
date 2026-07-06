export const makeUid = (len = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: len },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

/**
 * @typedef {Object} JiraTaskDto
 * @property {number|null} id
 * @property {string|null} jiraId
 * @property {string|null} jiraKey
 * @property {string|null} jiraParentKey
 * @property {string|null} jiraUrl
 * @property {string|null} jiraProjectLabel
 * @property {string|null} name
 * @property {string|null} status
 * @property {string|null} productGroup
 */

/**
 * @param {any} response
 * @returns {JiraTaskDto|null}
 */
export function mapJiraTaskResponseToDto(response) {
  if (!response || typeof response !== 'object') return null;

  const raw = { ...(response.existing ?? {}), ...(response.data ?? {}) };

  return {
    genId: raw.genId ?? response.genId ?? makeUid(),

    id: response.id ?? raw.id ?? null,
    jiraId: raw.jira_id ?? raw.jiraId ?? null,
    jiraKey: raw.jira_key ?? raw.jiraKey ?? null,
    jiraParentKey: raw.jira_parent_key ?? raw.jiraParentKey ?? null,
    jiraUrl: raw.jira_url ?? raw.jiraUrl ?? null,
    jiraProjectLabel: raw.jira_project_label ?? raw.jiraProjectLabel ?? null,
    name: raw.name ?? null,
    status: raw.status ?? null,
    productGroup: raw.product_group ?? raw.productGroup ?? null,
    qtyToDo: raw.qty_to_do ?? raw.qtyToDo ?? null,

    report: raw.report ?? {
      quantity: null,
      quantityGood: null,
      quantityScrap: null,
      dividerFactor : null,
      is_rework: false,
      remarks: '',
      requiresQuantity: true,
      requiresRemarks: false,
    },
  };
}

/**
 * @param {JiraTaskDto} task
 */
export function getTaskIdentity(task) {
    return task?.jiraId ?? task?.id ?? task?.jiraKey ?? null;
}