const jiraApiConnector = require('jira').JiraApi;
const config = require('../config');
const jiraConfig = config.jira;
const _ = require('lodash');

class JiraAPi {
    constructor() {
        this.jiraApi = new jiraApiConnector(
            'https',
            jiraConfig.host,
            jiraConfig.port,
            jiraConfig.user,
            jiraConfig.password,
            'latest'
        );
    }

    getAllMyProjects() {
        return new Promise(resolve => {
            this.jiraApi.listProjects(function(error, projects) {
                if (error) {
                    resolve([]);
                    return;
                }
                const projectsList = projects.map(({key}) => key);
                resolve(projectsList);
            });
        });
    }

    getIssue(issueId) {
        return new Promise((resolve, reject) => {
            this.jiraApi.findIssue(issueId, function(error, issue) {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({
                    key: issueId,
                    status: _.get(issue.fields, 'status.name'),
                    implementer: _.get(issue.fields, 'customfield_10502.name'),
                    fixVersions: (_.get(issue.fields, 'fixVersions', []) || []).map(({name}) => name),
                    summary: issue.fields.summary,
                    sprint: (_.get(issue.fields, 'customfield_10005', []) || [])
                        .filter(item => item.match(/state=(.*?),/mi)[1] === 'ACTIVE')
                        .map((item) => item.match(/name=(.*?),/mi)[1])
                });
            });
        });
    }
}

module.exports = new JiraAPi();
