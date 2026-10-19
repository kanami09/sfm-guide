// Step 2 of the automatic PR review, run by pr-review.yml through actions/github-script.
// Reads the results stored by pr-check.yml and either sends the PR back (request changes)
// or hands it to the repository owner for review.
//
// Everything inside the artifact comes from a run of untrusted PR code, so it is treated
// as plain text: the PR number is validated, and log output is only shown inside code blocks.

const fs = require('fs');
const path = require('path');

const BOT_LOGIN = 'github-actions[bot]';
const LABEL_FAIL = 'needs-fix';
const LABEL_PASS = 'ready-for-review';
const MARKER = '<!-- sfm-guide-pr-review -->';
const MAX_LOG_LINES = 80;
const MAX_LOG_CHARS = 12000;

const CHECKS = [
    {
        id: 'markdownlint',
        title: 'Markdown 风格（markdownlint）',
        local: 'npx markdownlint-cli2@0.23.3 "**/*.md" "#book"',
        hint: '规则说明见 https://github.com/DavidAnson/markdownlint#rules--aliases ，本仓库的配置在 `.markdownlint.jsonc`。',
    },
    {
        id: 'sfml',
        title: 'SFML 代码块语法',
        local: 'bash tools/sfml-check/check.sh',
        hint: '`FAIL 文件:行号` 指出了无法解析的代码块。故意写错的反例请标成 ```` ```sfml,error ````，仅作说明的片段标成 ```` ```sfml,ignore ````。',
    },
    {
        id: 'mdbook',
        title: 'mdBook 构建',
        local: 'mdbook build',
        hint: '常见原因是 `src/SUMMARY.md` 中引用的文件不存在，或者目录的格式有误。',
    },
];

function readArtifact(dir, name) {
    const file = path.join(dir, name);
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
}

// Keep the tail of a log, strip ANSI colors, and make sure it cannot break out of a code block.
function sanitizeLog(text) {
    if (text == null) return '（没有输出）';
    let lines = text.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '').replace(/\r/g, '').split('\n');
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    let omitted = 0;
    if (lines.length > MAX_LOG_LINES) {
        omitted = lines.length - MAX_LOG_LINES;
        lines = lines.slice(-MAX_LOG_LINES);
    }
    let body = lines.join('\n');
    if (body.length > MAX_LOG_CHARS) body = body.slice(-MAX_LOG_CHARS);
    body = body.replace(/`{3,}/g, (m) => 'ˋ'.repeat(m.length));
    return (omitted ? `……（前面省略 ${omitted} 行）\n` : '') + body;
}

function collectResults(dir) {
    return CHECKS.map((check) => {
        const status = readArtifact(dir, `${check.id}.status`);
        const passed = status !== null && status.trim() === '0';
        return { ...check, ran: status !== null, passed, log: readArtifact(dir, `${check.id}.txt`) };
    });
}

function buildFailureBody(results, runUrl) {
    const rows = results
        .map((r) => `| ${r.title} | ${r.passed ? '✅ 通过' : r.ran ? '❌ 未通过' : '⚠️ 未运行'} |`)
        .join('\n');
    const details = results
        .filter((r) => !r.passed)
        .map((r) => [
            `### ${r.title}`,
            '',
            r.hint,
            '',
            '```text',
            sanitizeLog(r.log),
            '```',
            '',
            `本地复现：\`${r.local}\``,
        ].join('\n'))
        .join('\n\n');
    return [
        MARKER,
        '## 自动化审查：**未通过**',
        '',
        '此 PR 未通过自动化审查，原因如下：',
        '',
        '| 检查项 | 结果 |',
        '| --- | --- |',
        rows,
        '',
        details,
        '',
        '请在修改后重新提交',
        '',
        `[查看完整日志](${runUrl})`,
    ].join('\n');
}

function buildPassBody(results, runUrl) {
    const rows = results.map((r) => `| ${r.title} | ✅ 通过 |`).join('\n');
    return [
        MARKER,
        '## 自动化审查：**通过**',
        '',
        '| 检查项 | 结果 |',
        '| --- | --- |',
        rows,
        '',
        `[查看完整日志](${runUrl})`,
    ].join('\n');
}

async function setLabels(github, repo, number, add, remove) {
    await github.rest.issues.addLabels({ ...repo, issue_number: number, labels: [add] });
    try {
        await github.rest.issues.removeLabel({ ...repo, issue_number: number, name: remove });
    } catch (e) {
        if (e.status !== 404) throw e; // the label was not on the PR
    }
}

// Withdraw this bot's earlier "request changes" reviews once the PR passes.
async function dismissOldRejections(github, core, repo, number) {
    const reviews = await github.paginate(github.rest.pulls.listReviews, { ...repo, pull_number: number });
    for (const review of reviews) {
        if (review.user?.login !== BOT_LOGIN || review.state !== 'CHANGES_REQUESTED') continue;
        try {
            await github.rest.pulls.dismissReview({
                ...repo,
                pull_number: number,
                review_id: review.id,
                message: '新的提交已通过自动化审查。',
            });
        } catch (e) {
            core.warning(`Could not dismiss review ${review.id}: ${e.message}`);
        }
    }
}

module.exports = async ({ github, context, core, artifactDir = 'pr-review' }) => {
    const repo = context.repo;
    const run = context.payload.workflow_run;
    const runUrl = run.html_url;

    // If the check job crashed before uploading its artifact, fall back to the PR number
    // that GitHub itself reports for the run (available for PRs from the same repository).
    let number = Number.parseInt((readArtifact(artifactDir, 'number') || '').trim(), 10);
    if (!Number.isInteger(number) || number <= 0) {
        number = run.pull_requests?.[0]?.number;
    }
    if (!Number.isInteger(number) || number <= 0) {
        core.setFailed('Could not determine the PR number for this run.');
        return;
    }

    const { data: pr } = await github.rest.pulls.get({ ...repo, pull_number: number });

    // The artifact is untrusted: make sure it really belongs to the commit this run checked.
    if (pr.head.sha !== run.head_sha) {
        core.info(`PR #${number} head is ${pr.head.sha}, run checked ${run.head_sha}; a newer run will review it.`);
        return;
    }
    if (pr.state !== 'open') {
        core.info(`PR #${number} is ${pr.state}; nothing to do.`);
        return;
    }

    const results = collectResults(artifactDir);
    const passed = results.every((r) => r.passed);

    if (!passed) {
        await github.rest.pulls.createReview({
            ...repo,
            pull_number: number,
            commit_id: run.head_sha,
            event: 'REQUEST_CHANGES',
            body: buildFailureBody(results, runUrl),
        });
        await setLabels(github, repo, number, LABEL_FAIL, LABEL_PASS);
        core.info(`PR #${number}: changes requested.`);
        return;
    }

    await dismissOldRejections(github, core, repo, number);
    await github.rest.pulls.createReview({
        ...repo,
        pull_number: number,
        commit_id: run.head_sha,
        event: 'COMMENT',
        body: buildPassBody(results, runUrl),
    });
    await setLabels(github, repo, number, LABEL_PASS, LABEL_FAIL);

    // GitHub does not allow requesting a review from the PR's own author.
    if (pr.user.login.toLowerCase() !== repo.owner.toLowerCase()) {
        try {
            await github.rest.pulls.requestReviewers({ ...repo, pull_number: number, reviewers: [repo.owner] });
        } catch (e) {
            core.warning(`Could not request review from ${repo.owner}: ${e.message}`);
        }
    }
    core.info(`PR #${number}: passed, handed to ${repo.owner}.`);
};

module.exports.sanitizeLog = sanitizeLog;
module.exports.buildFailureBody = buildFailureBody;
module.exports.buildPassBody = buildPassBody;
module.exports.collectResults = collectResults;
