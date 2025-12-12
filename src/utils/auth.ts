/**
 * Creates a basic authorization header using login name and login token
 *
 * @param {string} loginName - The login name for Jira authentication
 * @param {string} loginToken - The login token for Jira authentication
 * @returns {string} The formatted authorization header string
 */
export function createAuthHeader(loginName: string, loginToken: string): string {
    return `Basic ${Buffer.from(`${loginName}:${loginToken}`).toString('base64')}`;
}

/**
 * Validates that the required Jira credentials are present
 *
 * @param {string | undefined} jiraHost - The Jira host URL
 * @param {string | undefined} loginName - The login name for Jira authentication
 * @param {string | undefined} loginToken - The login token for Jira authentication
 * @throws {Error} If any of the required credentials are missing
 */
export function validateCredentials(jiraHost: string | undefined, loginName: string | undefined, loginToken: string | undefined): void {
    if (!jiraHost || !loginName || !loginToken) {
        throw new Error("Missing required Jira credentials. Please provide them in the request or set them in the .env file.");
    }
}

/**
 * Normalizes the Jira host URL by adding the https:// protocol if it's not already present
 *
 * @param {string} jiraHost - The Jira host URL
 * @returns {string} The normalized Jira host URL with protocol
 */
export function normalizeJiraHost(jiraHost: string): string {
    // Check if the host already has a protocol (http:// or https://)
    if (jiraHost.match(/^https?:\/\//i)) {
        return jiraHost;
    }

    // If no protocol is present, default to https://
    return `https://${jiraHost}`;
}
