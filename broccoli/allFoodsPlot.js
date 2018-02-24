function allFoods() {
    d3.csv('./food_prot_and_energy.csv').row(parseRow).get(createPlot);
    let utls = utils();

    function parseRow(row) {
        let protReq = 51,
            energyReq = 2000,
            protein = parseFloat(row.prot),
            energy = parseFloat(row.energy);
        return {
            name: row.name,
            energy: energy,
            protein: protein,
            gForProt: protReq / protein * 100,
            gForEnergy: energyReq / energy * 100,
            protPerc100: protein / protReq,
            energyPerc100: energy/ energyReq,
        };
    }

    function filterData(data) {
        // remove foods with less then .5 g of protein per 100 g
        return data.filter(d => d.protein >= .5 && d.gForEnergy <= 9000);
    }

    function formatPointsForPolygon(points, xScale, yScale) {
        return points.map(
            p => `${Math.round(xScale(p[0]))}, ${Math.round(yScale(p[1]))}`
        ).join(' ');
    }

    function setUpDefs(svg) {
        // filters
        let defs = svg.append('defs'),
            blurFilter = defs.append('filter')
                         .attr('id', 'blur-filter')
                         .attr('y', '-3').attr('x', '-3')
                         .attr('width', '12').attr('height', '12');
        blurFilter.append('feGaussianBlur')
                  .attr('in', 'SourceGraphic')
                  .attr('stdDeviation', '3')
                  .attr('result', 'blured');
        blurFilter.append('feComposite').attr('in', 'SourceGraphic');

        let floodFilter = defs.append('filter')
                              .attr('id', 'flood-filter')
                              .attr('x', 0).attr('y', 0)
                              .attr('width', 1).attr('height', 1);
        floodFilter.append('feFlood')
                   .attr('flood-color', 'white')
                   .attr('result', 'backgroundfill');
        floodFilter.append('feComposite')
                   .attr('in', 'SourceGraphic');
    }

    function createSectionLabel(textEl, firstLineText, secondLine, color) {
        let firstNepLine = textEl.append('tspan')
                                 .text(firstLineText);
        textEl.append('tspan').text(secondLine[0])
               .attr('dy', 16).attr('dx', -firstNepLine.node().getComputedTextLength());
        textEl.append('tspan').text(secondLine[1]).attr('fill', color).attr('font-weight', 'bold');
        textEl.append('tspan').text(secondLine[2]);

    }

    function setUpHeader(headerGroup) {
        headerGroup.append('text')
                   .text('Більшість рослинних продуктів мають достатньо білків')
                   .attr('class', 'plot-header');

        headerGroup.append('text')
                   .attr('y', 24)
                   .text('А ті, що не мають, можна комбінувати з іншими')
                   .attr('class', 'plot-subheader');

        let explanation = headerGroup.append('text')
                                     .attr('y', 52).attr('x', 0)
                                     .attr('class', 'plot-explanation');
        explanation.selectAll('tspan')
                   .data([
                    'Щоб побачити, з якими продуктами можна їсти «',
                    'недостатньо білкові',
                    '» рослини,  наведіть мишкою на',
                   ]).enter().append('tspan')
                   .text(d => d)
                   .attr('fill', (d, i) => i === 1? 'teal' : null);
        utls.createMultilineText(
            explanation, [
                '',
                'відповідну точку. На графіку підсвітяться усі продукти, які в поєднанні 1:1 із вибраним',
                'швидше забезпечать добову потребу у білках*, ніж в калоріях. Справа можна побачити список ↓ цих продуктів.'
            ], 18
        )
    }

    function setUpFooter(footerGroup) {
        let footerText = footerGroup.append('text').attr('class', 'unemph-filled')
                                    .attr('font-style', 'italic')
                                    .text('*для цього графіка добова потреба у білку — 51 г, енергії — 2 000 ккал');
    }

    function setUpXAxis(xAxisGroup, xScale) {
        let xAxis, yAxis, yAxisCont;
        xAxis = d3.axisBottom(xScale)
                  .tickFormat(utls.locale.format(','));
        xAxisGroup.call(xAxis);
        let xAxisLabel = xAxisGroup.append('text')
                                   .attr('class', 'unemph-filled')
                                   .attr('x', xScale(8500))
                                   .attr('y', 16)
                                   .attr('text-anchor', 'start');
        utls.createMultilineText(
            xAxisLabel, ['грам, щоб задовольнити', 'енергетичну потребу'], 13
        );
    }

    function setUpYAxis(yAxisGroup, yScale) {
        yAxis = d3.axisLeft(yScale)
                  .ticks(5);
        yAxisGroup.call(yAxis);
        yAxisGroup.append('text')
                  .attr('class', 'unemph-filled')
                  .text('грам, щоб задовольнити білкову потребу')
                  .attr('transform', 'translate(-50) rotate(270)');
    }

    function createPlot(data) {
        data = filterData(data);
        let container = d3.select('#all-foods-plot'),
            svgWidth = 770,
            svgHeight = 600,
            margin = {top: 120, right: 190, bottom: 60, left: 60},
            svg = container.append('svg')
                           .attr('width', svgWidth)
                           .attr('height', svgHeight),
            plotWidth = svgWidth - margin.left - margin.right,
            plotHeight = svgHeight - margin.top - margin.bottom,
            plot = svg.append('g')
                      .attr('id', 'all-food-plot')
                      .attr('transform', `translate(${margin.left}, ${margin.top})`),
            foodList = svg.append('g').attr('id', 'all-food-list')
                          .attr('transform', `translate(${plotWidth + margin.left}, ${margin.top})`),
            header = svg.append('g').attr('id', 'all-food-header')
                        .attr('transform', `translate(${margin.left}, 20)`),
            footer = svg.append('g').attr('id', 'all-food-footer')
                        .attr('transform', `translate(${margin.left}, ${svgHeight - margin.bottom + 50})`)

        setUpDefs(svg);

        // header & footer
        setUpHeader(header);
        setUpFooter(footer);

        // scales
        let xScale, yScale;
        xScale = d3.scaleLinear().domain(
            [0, d3.max(data, utls.attrGetter('gForEnergy')) + 160]
        ).range([0, plotWidth]);
        yScale = d3.scaleLinear().domain(
            [-1, d3.max(data, utls.attrGetter('gForProt')) + 200]
        ).range([plotHeight, 0])

        // axes
        let yAxisGroup, xAxisGroup;
        xAxisGroup = plot.append('g')
                        .attr('class', 'axis xaxis-container')
                        .attr('transform', `translate(0, ${plotHeight})`);
        setUpXAxis(xAxisGroup, xScale);

        yAxisGroup = plot.append('g')
                        .attr('class', 'axis yaxis-container');
        setUpYAxis(yAxisGroup, yScale);

        // apply classes
        svg.selectAll('path.domain, .tick line')
           .classed('unemph-line', true);
        svg.selectAll('.tick text')
           .classed('unemph-filled', true);

        // not enough protein triangle
        let points = [
            [0, 0], [0, yScale.domain()[1]], [yScale.domain()[1], yScale.domain()[1]]
        ];
        plot.append('polygon')
            .attr('points', formatPointsForPolygon(points, xScale, yScale))
            .attr('class', 'not-enough-prot');
        plot.append('line')
            .attr('x1', xScale(points[0][0])).attr('y1', yScale(points[0][1]))
            .attr('x2', xScale(points[2][0])).attr('y2', yScale(points[2][1]))
            .attr('class', 'not-enough-prot');

        //labels
        let nepText = plot.append('text')
                          .attr('x', xScale(200))
                          .attr('y', yScale(8000))
                          .attr('class', 'not-enough-prot section-label');
        let nepCount = data.filter(d => d.gForProt > d.gForEnergy).length;
        //createSectionLabel(textEl, firstLineText, secondLine, color
        createSectionLabel(nepText, 'Продукти, з яких не можна отримати', [
            'достатньо білка не переївшися (', nepCount, ' шт.)'
        ], 'teal')
        let epText = plot.append('text')
                         .attr('x', xScale(5200))
                         .attr('class', 'section-label')
                         .attr('y', yScale(800));
        createSectionLabel(epText, 'Продукти, якими не можна переїстися', [
            'не отримавши достатньо білка (', data.length - nepCount, ' шт.)'
        ], '#ff6600')

        // dots
        let dots, dotGroup, r = 3;
        dotGroup = plot.append('g').attr('class', 'scattered-dots');
        dots = dotGroup.selectAll('circle')
                       .data(data, utls.attrGetter('name'))
                       .enter()
                       .append('circle')
                       .attr('cy', d => yScale(d['gForProt']))
                       .attr('cx', d => xScale(d['gForEnergy']))
                       .attr('r', r)
                       .attr('fill', d=> d.gForProt > d.gForEnergy? 'teal': '#ff6600')
                       .attr('class', 'all-foods-dots');

        dots.on('mouseover', dotMouseOver);
        dots.on('mouseout', dotMouseOut);
        dots.filter(d => d.name === "м'ясо").attr('fill', 'red').attr('r', 3.5);

        function dotMouseOver (d) {
            showLabel(d);
            if (d.gForProt > d.gForEnergy) {showCombinations(d)};
        }

        function dotMouseOut (d) {
            dotGroup.select('text').remove();
            // TODO make a class and move all of this to css
            dots.attr('stroke', null).attr('filter', null);
            foodList.selectAll('text').remove();
            d3.select('#combination-line').remove();
        }

        function showLabel(d) {
            dotGroup.append('text')
                    .attr('x', xScale(d['gForEnergy']) + 6)
                    .attr('y', yScale(d['gForProt']) + 3)
                    .attr('font-weight', 'bold')
                    .attr('filter', 'url(#flood-filter)')
                    .text(d.name);
        }

        function showCombinations (d) {
            function filterFunc (d1) {
                return (d1.protPerc100 - d1.energyPerc100 >=
                        d.energyPerc100 - d.protPerc100);
            }
            dots.filter(filterFunc)
                .attr('filter', 'url(#blur-filter)')
                .attr('stroke', 'black')
                .attr('stroke-width', 1.5);
            let betterFoods = data.filter(filterFunc);
            betterFoods = betterFoods.sort(
                (d1, d2) => ((d1.protPerc100 - d1.energyPerc100) <
                             (d2.protPerc100 - d2.energyPerc100))
            );
            foodList.selectAll('text')
                    .data(betterFoods)
                    .enter()
                    .append('text')
                    .text(d => d.name)
                    .attr('x', 20)
                    .attr('y', (d, i) => 5 + 10.5 * i)
                    .attr('class', 'food-combine');
            deliniation(d.gForEnergy, d.gForProt);
        }

        function deliniation (x, y) {
            let a = 1/y - 1/x;
            let points = [[xScale.domain()[1], 0]].concat(
                d3.range(0, xScale.domain()[1], 50).map(d=> [d, d/(1 - a*d)])
            );
            let formatted = formatPointsForPolygon(points, xScale, yScale);
            plot.append('polyline')
                .attr('points', formatted)
                .attr('id', 'combination-line')
                .attr('fill', '#ff6600')
                .attr('opacity', .16)
                .attr('stroke', 'none');
        }
    }
}
