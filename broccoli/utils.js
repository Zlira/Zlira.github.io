function utils () {
    function attrGetter(attrName) {
        return function (d) {return d[attrName]};
    };

    // TODO make this function more generic - given svg container split the
    // text to tspans and insert them
    function createMultilineText(textContainer, lines, lineHeight) {
        let i, lineStart = textContainer.attr('x')
        for (i=0; i < lines.length; i++) {
            textContainer.append('tspan')
                         .text(lines[i])
                         .attr('x', lineStart)
                         .attr('dy', i && lineHeight);
        }
    }
    // TODO maybe do this with default attrs
    function createLine(contEl, data, lineFunc, stroke) {
        return contEl.append('path')
                     .data(data)
                     .attr('d', lineFunc)
                     .attr('stroke', stroke)
                     .attr('stroke-width', 2)
                     .attr('fill', 'none');
    }

    function setHidden(selections, delay=0) {
        function _setHidden(arr, hidden) {
            if (arr !== undefined) {
                arr.forEach(function (el) {
                    el.transition().duration(0).delay(delay)
                       .attr('display', hidden? 'none' : null);
                })
            }
        }
        _setHidden(selections.toHide, true);
        _setHidden(selections.toShow, false);
    }

    return {
        attrGetter: attrGetter,
        createMultilineText: createMultilineText,
        createLine: createLine,
        setHidden: setHidden,
        locale: d3.formatLocale({
            thousands: ' ',
            grouping: [3],
            decimal: ',',
            currency: '₴',
        }),
    }
}
