// 中文搜索：保留 mdBook 自带的搜索界面，把背后的检索引擎换成 MiniSearch
// （theme/minisearch.js）。
//
// mdBook 的索引只按空白切词，中文几乎都进不了索引。不过它的 documentStore
// 按小节保存了全文，本脚本就在浏览器里用这些全文重新建索引：中文切成相邻
// 两字的片段（bigram），建索引和查询时的切法相同。mdBook 的搜索栏、结果列表、
// 快捷键和跳转后的页内高亮都保持原样。
//
// 依赖 mdBook 0.5.4 的内部实现：searcher.js 第一次打开搜索时调用
// elasticlunr.Index.load()，之后调用 `index.search(term, options)`，并把第 i 条
// 结果渲染成 #mdbook-searchresults 下的第 i 个 <li>。数据格式不符时，退回
// mdBook 原来的搜索。
(function () {
    'use strict';
    if (typeof elasticlunr === 'undefined' || typeof MiniSearch === 'undefined') { return; }

    const HAN = /\p{Script=Han}/u;
    const RUNS = /\p{Script=Han}+|[^\p{Script=Han}]+/gu;
    // 与 MiniSearch 默认的分隔符相同：空白和标点。
    const SEPARATOR = /[\n\r\p{Z}\p{P}]+/u;
    const TEASER_BEFORE = 30;
    const TEASER_LENGTH = 120;

    // 最近一次搜索，用于改写已渲染结果的摘要。
    let last_term = '';
    let last_docs = [];

    function bigrams(chars) {
        const out = [];
        for (let i = 0; i + 1 < chars.length; i++) { out.push(chars[i] + chars[i + 1]); }
        return out;
    }

    // 连续的汉字切成 bigram（建索引时再加上单字，让单字查询也能匹配）；
    // 其他文字按空白和标点切成单词。
    function tokenize(text, with_chars) {
        const tokens = [];
        for (const run of text.match(RUNS) || []) {
            if (HAN.test(run)) {
                const chars = Array.from(run);
                if (with_chars || chars.length === 1) { tokens.push(...chars); }
                tokens.push(...bigrams(chars));
            } else {
                for (const word of run.split(SEPARATOR)) {
                    if (word) { tokens.push(word); }
                }
            }
        }
        return tokens;
    }

    function create_index(docs) {
        const index = new MiniSearch({
            idField: 'id',
            fields: ['title', 'body', 'breadcrumbs'],
            tokenize: function (text) { return tokenize(text, true); },
        });
        index.addAll(Object.keys(docs).map(function (id) { return docs[id]; }));

        return {
            // `options` 是 mdBook 的搜索配置：bool、expand 和各字段的 boost。
            search: function (term, options) {
                const boost = {};
                for (const field in options.fields) { boost[field] = options.fields[field].boost; }
                const results = index.search(term, {
                    tokenize: function (text) { return tokenize(text, false); },
                    combineWith: options.bool === 'OR' ? 'OR' : 'AND',
                    boost: boost,
                    prefix: function (t) { return options.expand && !HAN.test(t); },
                    fuzzy: function (t) { return !HAN.test(t) && t.length > 4 ? 0.2 : false; },
                });
                last_term = term;
                last_docs = results.map(function (r) { return docs[r.id]; });
                return results.map(function (r) { return { ref: r.id, score: r.score, doc: docs[r.id] }; });
            },
        };
    }

    const original_load = elasticlunr.Index.load;
    elasticlunr.Index.load = function (data) {
        const docs = data && data.documentStore && data.documentStore.docs;
        if (!docs) { return original_load.apply(this, arguments); }
        return create_index(docs);
    };

    function escape_html(s) {
        return s.replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; });
    }

    function escape_regexp(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function make_pattern(alternatives) {
        if (alternatives.length === 0) { return null; }
        alternatives.sort(function (a, b) { return b.length - a.length; });
        return new RegExp(alternatives.join('|'), 'giu');
    }

    // 返回 [exact, loose]：`exact` 匹配查询中的整段汉字和单词（搜索使用前缀
    // 匹配，所以单词也会匹配到更长单词的剩余部分）；`loose` 另外还匹配汉字的
    // bigram。
    function teaser_patterns(term) {
        const exact = [];
        const loose = [];
        for (const run of term.match(RUNS) || []) {
            if (HAN.test(run)) {
                exact.push(escape_regexp(run));
                loose.push(...bigrams(Array.from(run)).map(escape_regexp));
            } else {
                for (const word of run.split(SEPARATOR)) {
                    if (word) { exact.push(escape_regexp(word) + '[A-Za-z0-9_]*'); }
                }
            }
        }
        return [make_pattern(exact.slice()), make_pattern(exact.concat(loose))];
    }

    // mdBook 的摘要只在空格之间找搜索词，永远找不到中文词。这里改为截取第一个
    // 匹配处前后的文字，加粗完整的查询词；摘要里没有完整的词时，改为加粗 bigram。
    function make_teaser(body, term) {
        const patterns = teaser_patterns(term);
        let start = 0;
        for (const pattern of patterns) {
            const m = pattern && pattern.exec(body);
            if (m) {
                start = Math.max(0, m.index - TEASER_BEFORE);
                break;
            }
        }
        const end = Math.min(body.length, start + TEASER_LENGTH);
        const text = body.slice(start, end);
        let highlight = patterns[0];
        if (highlight) { highlight.lastIndex = 0; }
        if (!highlight || !highlight.test(text)) { highlight = patterns[1]; }

        let html = '';
        let done = 0;
        if (highlight) {
            highlight.lastIndex = 0;
            let m;
            while ((m = highlight.exec(text)) !== null) {
                html += escape_html(text.slice(done, m.index)) + '<em>' + escape_html(m[0]) + '</em>';
                done = m.index + m[0].length;
            }
        }
        html += escape_html(text.slice(done));
        return (start > 0 ? '…' : '') + html + (end < body.length ? '…' : '');
    }

    const list = document.getElementById('mdbook-searchresults');
    if (list) {
        new MutationObserver(function () {
            const items = list.children;
            for (let i = 0; i < items.length && i < last_docs.length; i++) {
                const teaser = items[i].querySelector('.teaser');
                if (teaser) { teaser.innerHTML = make_teaser(last_docs[i].body || '', last_term); }
            }
        }).observe(list, { childList: true });
    }
})();
