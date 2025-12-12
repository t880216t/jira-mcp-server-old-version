import axios from "axios";
import { JiraApiRequestSchema } from "../validators/index.js";
import { createAuthHeader, validateCredentials, normalizeJiraHost } from "../utils/auth.js";

/**
 * Description object for the Jira list projects tool
 * @typedef {Object} ListProjectsToolDescription
 * @property {string} name - The name of the tool
 * @property {string} description - Description of the tool's functionality
 * @property {Object} inputSchema - Schema defining the expected input parameters
 */
export const listProjectsToolDescription = {
    name: "jira_list_projects",
    description: "Lists all Jira projects the user has access to",
    inputSchema: {
        type: "object",
        properties: {
            jiraHost: {
                type: "string",
                description: "The Jira host URL (e.g., 'your-domain.atlassian.net')",
                default: process.env.JIRA_HOST || "",
            },
            loginName: {
                type: "string",
                description: "Login name for Jira 8.1.0 authentication",
                default: process.env.JIRA_LOGIN_NAME || "",
            },
            loginToken: {
                type: "string",
                description: "Login token for Jira 8.1.0 authentication",
                default: process.env.JIRA_LOGIN_TOKEN || "",
            },
        },
        required: [],
    },
};

/**
 * Lists all Jira projects that the user has access to
 * 
 * @async
 * @param {Object} args - The arguments for listing projects
 * @param {string} args.jiraHost - The Jira host URL
 * @param {string} args.loginName - Login name for authentication
 * @param {string} args.loginToken - Login token for authentication
 * @returns {Promise<Object>} A formatted response with the list of projects
 * @throws {Error} If the required credentials are missing or the request fails
 */
export async function listProjects(args: any) {
    const validatedArgs = await JiraApiRequestSchema.validate(args);

    const jiraHost = validatedArgs.jiraHost || process.env.JIRA_HOST;
    const loginName = validatedArgs.loginName || process.env.JIRA_LOGIN_NAME;
    const loginToken = validatedArgs.loginToken || process.env.JIRA_LOGIN_TOKEN;

    if (!jiraHost || !loginName || !loginToken) {
        throw new Error('Missing required authentication credentials. Please provide jiraHost, loginName, and loginToken.');
    }

    validateCredentials(jiraHost, loginName, loginToken);

    const authHeader = createAuthHeader(loginName, loginToken);

    try {
        const response = await axios.get(`${normalizeJiraHost(jiraHost)}/rest/api/3/project`, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json',
            },
        });

        const projects = response.data;

        let formattedResponse = `# Jira Projects\n\n`;
        formattedResponse += `Total projects: ${projects.length}\n\n`;

        if (Array.isArray(projects) && projects.length > 0) {
            formattedResponse += `| Project Key | Name | Type | Lead |\n`;
            formattedResponse += `|------------|------|------|------|\n`;

            projects.forEach((project: any) => {
                formattedResponse += `| ${project.key} | ${project.name} | ${project.projectTypeKey || 'N/A'} | ${project.lead?.displayName || 'Unknown'} |\n`;
            });
        } else {
            formattedResponse += "No projects found or you don't have access to any projects.";
        }

        return {
            content: [{ type: "text", text: formattedResponse }],
            isError: false,
        };
    } catch (error: any) {
        let errorMsg = "An error occurred while listing projects.";

        if (error.response) {
            errorMsg = `Error ${error.response.status}: ${error.response.data?.errorMessages?.join(', ') || error.message}`;
        } else if (error.message) {
            errorMsg = error.message;
        }

        return {
            content: [{ type: "text", text: `# Error\n\n${errorMsg}` }],
            isError: true,
        };
    }
}
