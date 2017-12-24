const glob = require('glob');
const marked = require('marked');
const path = require('path');
const lodash = require('lodash');
const fs = require('fs');

const pluginName = 'auto-summary';

const commonIgnore = [
    'node_modules/**',
    '_*/**',
];

function getTitleOfMarkdownFile(file) {
    const contents = fs.readFileSync(file).toString();
    return (lodash.find(marked.lexer(contents), (n) => n.type === "heading") || {}).text
}

function groupByDir(files) {
    const fileTree = {};
    files.forEach((file) => {
        lodash.set(fileTree, file.split(path.sep), file)
    });
    return fileTree
}


function getSummaryByFileTree(obj, readmeFilename) {
    const summary = {
        children: []
    };
    lodash.forEach(obj, (child, sub) => {
        if (lodash.isObject(child)) {
            summary.children.push(getSummaryByFileTree(child, readmeFilename))
        } else {
            if (sub === readmeFilename) {
                summary.file = child;
                summary.title = getTitleOfMarkdownFile(child)
            } else {
                summary.children.push({
                    file: child,
                    title: getTitleOfMarkdownFile(child),
                })
            }
        }
    });
    return summary
}

function toListing(node = {}, level = 0) {
    if (!node.file) {
        return (node.children || []).map((subNode) => toListing(subNode, level)).join("\n")
    }
    return [`${lodash.repeat("  ", level)}* [${node.title}](${node.file})`]
        .concat((node.children || []).map((subNode) => toListing(subNode, level + 1)))
        .join("\n")
}

function getSummaryByFiles(files, readmeFilename) {
    return toListing(getSummaryByFileTree(groupByDir(files), readmeFilename))
}


function init() {
    const root = this.resolve('');
    const readmeFilename = this.config.get('structure.readme');
    const parts = lodash.get(this.options, ["pluginsConfig", pluginName], {}).parts;

    const finalSummaryContents = [];

    const otherFiles = glob.sync("*/**/*.md", {
        cwd: root,
        ignore: commonIgnore.concat(lodash.keys(parts))
    });

    if (otherFiles.length > 0) {
        finalSummaryContents.push(getSummaryByFiles(files, readmeFilename));
    }

    lodash.forEach(parts, (title, pattern) => {
        const files = glob.sync(pattern, {
            cwd: root,
            ignore: commonIgnore
        });
        finalSummaryContents.push(`## ${title}`);
        finalSummaryContents.push(getSummaryByFiles(files, readmeFilename));
    });

    fs.writeFileSync("SUMMARY.md", finalSummaryContents.join("\n\n"))
}

module.exports = {
    hooks: {
        init,
    }
};