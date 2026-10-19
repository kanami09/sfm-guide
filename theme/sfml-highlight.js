// SFML syntax highlighting for highlight.js 10.x (bundled with mdBook).
// Keyword list follows the lexer rules of SFML.g4 in SFM 4.34.0.
(function () {
    'use strict';
    if (typeof hljs === 'undefined') { return; }

    hljs.registerLanguage('sfml', function (hljs) {
        return {
            name: 'SFML',
            case_insensitive: true,
            keywords: {
                keyword: 'name every do end if then else input output from to forget',
                built_in: 'retain each except with without tag round robin by label block empty slots slot in where',
                type: 'top bottom north east south west left right front back null side',
                symbol: 'ticks tick seconds second global plus redstone pulse',
                literal: 'true false',
                operator: 'not and or has gt lt eq le ge overall some one lone'
            },
            contains: [
                hljs.COMMENT('--', '$'),
                {
                    className: 'string',
                    begin: '"', end: '"',
                    contains: [{ begin: '\\\\"' }]
                },
                {
                    className: 'meta',
                    begin: '#[A-Za-z0-9_*:/]+'
                },
                {
                    className: 'number',
                    begin: '\\b\\d+[gG]?\\b'
                },
                {
                    className: 'punctuation',
                    begin: '>=|<=|[<>=+]'
                }
            ]
        };
    });

    function highlightSfml() {
        var blocks = document.querySelectorAll('code.language-sfml');
        Array.prototype.forEach.call(blocks, function (block) {
            var text = block.textContent;
            block.innerHTML = hljs.highlight('sfml', text, true).value;
            block.classList.add('hljs');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', highlightSfml);
    } else {
        highlightSfml();
    }
})();
