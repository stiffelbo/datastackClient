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

    const raw = { ...response.existing, ...response.data };
    
    if (!raw) return null;

    return {
        id: response.id ?? raw.id ?? null,
        jiraId: raw.jira_id ?? null,
        jiraKey: raw.jira_key ?? null,
        jiraParentKey: raw.jira_parent_key ?? null,
        jiraUrl: raw.jira_url ?? null,
        jiraProjectLabel: raw.jira_project_label ?? null,
        name: raw.name ?? null,
        status: raw.status ?? null,
        productGroup: raw.product_group ?? null,
        //placeholder for reports
        report : {
            quantity: null, //tutaj można dodać ilosc nominalną lub pozostałą do produkcji, w zależności od potrzeb
        },
    };
}

/**
 * @param {JiraTaskDto} task
 */
export function getTaskIdentity(task) {
    return task?.jiraId ?? task?.id ?? task?.jiraKey ?? null;
}