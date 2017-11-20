'use strict';
function nutPlot() {
    let utls = utils(),
        formatter = utls.locale.format('.1f');

    function createDefs(svgEl, containerSelector, xScale, yScale) {
        let filterId = 'textBackGr';
        let defs = svgEl.append('defs');
        let filter = defs.append('filter')
                         .attr('x', 0).attr('y', 0)
                         .attr('width', 1).attr('height', 1)
                         .attr('id', filterId);
        filter.append('feFlood').attr('flood-color', '#fff7b7');
        filter.append('feComposite').attr('in', 'SourceGraphic');

        let plotClipPathId = 'plot-clip-' + containerSelector.slice(1);
        let clipPath = defs.append('clipPath')
                           .attr('id', plotClipPathId);
        clipPath.append('rect')
                .attr('x', 0).attr('y', yScale.range()[1])
                .attr('width', svgEl.attr('width'))
                .attr('height', yScale.range()[0]);
        return {
            plotClipPath: clipPath,
            backgroundFilter: filter,
        }
    }

    // this function sets up an svg with two groups: one for plot and
    // one for button area. than it sets up top level groups inside
    // the plot group
    function setUpContainerGroups(outerContainer, width, height, margin) {
        let btnCont, pltCont, bkgrCont, xAxisCont, yAxisCont, lineCont, dailyReqCont,
            svg = outerContainer.append('svg')
                                .attr('width', width)
                                .attr('height', height),
            w = width - margin.left - margin.right,
            h = height - margin.top - margin.bottom;

        // button container
        btnCont = svg.append('g').attr('id', 'btn-container');

        // plot container
        pltCont = svg.append('g')
                     .attr('id', 'plot-container')
                     .attr('transform', 'translate('+ margin.left +','+ margin.top +')');

        // CHILDREN of plot container
        // a group for background rectangles
        bkgrCont = pltCont.insert('g', ':first-child')
                          .attr('id', 'rect-container');

        // x axis container
        // TODO xaxis-container should be class not id
        xAxisCont = pltCont.append('g')
                           .attr('transform', `translate(0, ${h})`)
                           .attr('class', 'axis')
                           .attr('id', 'xaxis-container');

        // y axis container
        yAxisCont = pltCont.append('g')
                           .attr('id', 'yaxis-container')
                           .attr('class', 'axis');

        // requirements
        dailyReqCont = pltCont.append('g').attr('id', 'daily-req-container');

        // lines container
        lineCont = pltCont.append('g')
                          .attr('id', 'line-container');

        return {
            svg: svg,
            container: pltCont,
            btnContainer: btnCont,
            bkgrContainer: bkgrCont,
            xAxisContainer: xAxisCont,
            yAxisContainer: yAxisCont,
            lineContainer: lineCont,
            dailyReqContainer: dailyReqCont,
            // TODO theese are not width and height of svg element but of
            // the plot group
            width: w,
            height: h
        };
    }

    // this function returns an object holding data about all eaten items
    function eatenData (food) {
        let grams = 0,
            prot = 0,
            kcal = 0;
        return {
            grams: grams,
            prot: prot,
            kcal: kcal,
            removeAllFood: function () {
                this.grams = 0;
                this.prot = 0;
                this.kcal = 0;
            },
            addFood: function (gramIncrement) {
                this.grams += gramIncrement;
                this.prot += food.prot / 100 * gramIncrement;
                this.kcal += food.kcal / 100 * gramIncrement;
            }
        }
    }

    function setUpXAxis(scale, svgContainer) {
        function applyClassToTicks() {
            svgContainer.xAxisContainer
                        .selectAll('path.domain, .tick line')
                        .classed('unemph-line', true);
            svgContainer.xAxisContainer
                        .selectAll('.tick text')
                        .classed('unemph-filled', true);
        }
        let axis, label,
            labelText = 'г їжі',
            labelPos = `translate(${scale.range()[1] + 20}, 16)`;
        axis = d3.axisBottom(scale)
                 .ticks(5)
                 .tickFormat(utls.locale.format(','));
        svgContainer.xAxisContainer.call(axis);
        applyClassToTicks();
        label = svgContainer.xAxisContainer
                            .append('text')
                            .text(labelText)
                            // TODO this is horrible and too ad hoc
                            .attr('x', 0).attr('y', 0)
                            .attr('text-anchor', 'start')
                            .attr('transform', labelPos)
                            .classed('unemph-filled', true)
                            .classed('axis-label', true);
        return {
            axis: axis,
            label: label,
            labelText: labelText,
            labelPos: labelPos,
            changeDomain: function(newMaxVal) {
                let currDomain = scale.domain();
                currDomain[1] = newMaxVal;
                scale.domain(currDomain);
                svgContainer.xAxisContainer.call(axis);
                applyClassToTicks();
            }
        }
    }

    // TODO make a class / constructor for both x and y axes
    function setUpYAxis(scale, svgContainer) {
        let axis, label, labelPos,
            labelText = '% від добової потреби';
        axis = d3.axisLeft(scale)
                  .ticks(4)
                  .tickSize(0)
                  .tickPadding(8)
                  .tickFormat(d3.format('.0%'));
        svgContainer.yAxisContainer.call(axis);
        // classes for axis styling
        svgContainer.yAxisContainer
                    .select('path.domain')
                    .classed('unemph-line', true);
        svgContainer.yAxisContainer
                    .selectAll('.tick text')
                    .classed('unemph-filled', true);
        label = svgContainer.yAxisContainer
                            .append('text')
                            .text(labelText)
                            .attr('x', 0)
                            .attr('y', 0)
                            .classed('unemph-filled', true)
                            .classed('axis-label', true)
                            .attr('text-anchor', 'start');
        labelPos = `translate(-45, ${label.node().getComputedTextLength()}) rotate(270)`;
        label.attr('transform', labelPos);
        svgContainer.yAxisContainer
                    .selectAll('text')
                    .filter(function (d) {
                       return d3.select(this).text() === '100%';
                    })
                    .attr('id', 'hundred-percent');
        return {
            axis: axis,
            label: label,
            labelText: labelText,
            labelPos: labelPos,
            transitionProgress: 0,
        }
    }

    function setUpButton(container, food, margin) {
        let btnGroup, btn, verboseLabel, labX, labY, padding,
            btnWidth = 170;
        btnGroup = container.append('g').attr('class', 'button');
        btn = btnGroup.append('rect')
                      .attr('x', margin.left).attr('y', 20)
                      .attr('width', btnWidth).attr('height', 20)
                      .attr('class', 'eat-btn');
        btnGroup.append('text')
                .attr('x', margin.left + btnWidth/2).attr('y', 35)
                .text(`З'їсти 100  г ${food.name}`)
                .attr('text-anchor', 'middle')
                .attr('class', 'eat-btn-text')
                .attr('font-size', '14px');

        padding = 20;

        labX = parseInt(btn.attr('x')) + parseInt(btn.attr('width')) + padding;
        labY = btn.attr('y')
        verboseLabel = container.append('text')
                                .attr('class', 'verbose-label')
                                .attr('x', labX).attr('y', labY);
        utls.createMultilineText(
            verboseLabel,
            ["Для цього можна «з'їдати» по 100 г їжі клацаючи на кнопку", "Вперед!"], 15
        );
        verboseLabel.attr('transform', 'translate(0, 10)');

        return {
            group: btnGroup,
            verboseLabel: verboseLabel
        }
    }

    function setUpRequirements(svgContainer, yScale) {
        let dailyLineEl, dailyReqText,
            achieved = false,
            dailyNorm = {
                prot: 44.8,
                kcal: 2000
            },
            lineFunc = d3.line().x(utls.attrGetter('x')).y(utls.attrGetter('y')),
            dailyReqY = yScale(1),
            initPoint = {x: 0, y: dailyReqY},
            endPoint = {x: svgContainer.width, y: dailyReqY};

        function setMultilineText(text) {
            dailyReqText.text('');
            dailyReqText.selectAll('tspan').remove();
            utls.createMultilineText(dailyReqText, text, 20);
        }

        function setInitText() {
            setMultilineText([
                'Треба набрати 100%',
                'денної норми білка ' + `(${formatter(dailyNorm.prot)} г)`,
                'і не перевищити',
                'норми калорій ' + `(${dailyNorm.kcal} ккал)`,
            ]);
        }

        dailyLineEl = svgContainer.dailyReqContainer
                                  .append('line')
                                  .attr('x1', initPoint.x).attr('y1', initPoint.y)
                                  .attr('x2', endPoint.x).attr('y2', endPoint.y)
                                  .attr('stroke-width', 2);
        dailyLineEl.attr('id', 'requirements-line');
        dailyReqText = svgContainer.dailyReqContainer
                                       .append('text')
                                       .attr('x', svgContainer.width + 6)
                                       .attr('y', dailyReqY + 2)
                                       .attr('id', 'requirements-text');
        setInitText();
        return {
            achieved: achieved,
            dailyNorm: dailyNorm,
            line: dailyLineEl,
            text: dailyReqText,
            setInitText: setInitText,
            setMultilineText: setMultilineText,
            changeProtNorm: function (newVal) {
                dailyNorm.prot = newVal;
                return dailyNorm;
            },
            texts: [
                ['Зжували 1 кг!', 'Ще ложечку за маму'],
                ['2 кг! Ложечку за тата?'],
                ['3 кг! У вас багато родичів?'],
                ['За двоюрідну сестру', 'дідової стрийни!'],
                ['За швагра', 'другого чоловіка тети'],
                ['За мітохондріальну Єву!'],
                ['За того звірозубого ящера!'],
                ['За останнього', 'універсального предка!'],
            ]
        }
    }

    // TODO too many arguments think about abstracting this further
    function nutrientLine(container, name, color, xScale,
                          yScale, eaten, requirements, clipPathId) {
        let g, line, lineEl, dot, label, text;
        function getYVal (d) {
            return !requirements.dailyNorm[name]? yScale.range()[0]:
                    yScale(d[name] / requirements.dailyNorm[name]);
        };

        function formatLastNutVal () {
            let unit = name === 'kcal'? 'ккал' : 'г білка';
            return `${Math.round(eaten[name])} ${unit}`;
        }
        g = container.append('g').attr('class', 'nutline')
        lineEl = g.append('line')
                  .attr('stroke', color)
                  .attr('stroke-width', 2)
                  .attr('x1', 0).attr('y1', yScale.range()[0])
                  .attr('x2', xScale(eaten.grams))
                  .attr('y2', getYVal(eaten));

        g.attr('clip-path', `url(#${clipPathId})`);
        dot = g.append('circle')
               .attr('cx', xScale(eaten.grams))
               .attr('cy', getYVal(eaten))
               .attr('r', 4)
               .attr('fill', color);

        label = g.append('text')
                 .text(formatLastNutVal())
                 .attr('x', xScale(eaten.grams) + 8)
                 .attr('y', getYVal(eaten) + 4)
                 .attr('fill', color)
                 .attr('class', 'tail-label');
        return {
            line: line,
            lineEl: lineEl,
            dot: dot,
            group: g,
            label: label,
            update: function () {
                text = d3.format('.1f')(eaten[name])
                this.lineEl
                    .attr('x2', xScale(eaten.grams))
                    .attr('y2', getYVal(eaten));
                this.dot
                    .attr('cx', xScale(eaten.grams))
                    .attr('cy', getYVal(eaten));
            },
            updateWithTransition: function(duration) {
                this.lineEl
                    .transition()
                    .duration(duration)
                    .attr('x2', xScale(eaten.grams))
                    .attr('y2', getYVal(eaten));
                this.dot
                    .transition()
                    .duration(duration)
                    .attr('cx', xScale(eaten.grams))
                    .attr('cy', getYVal(eaten));
                this.label
                    .transition()
                    .duration(duration)
                    .text(formatLastNutVal())
                    .attr('x', xScale(eaten.grams) + 8)
                    .attr('y', getYVal(eaten) + 4);
            },
        }
    }

    function nutPlot(food, containerSelector) {
        let requirements, xScale, yScale, yAxis, xAxis, btn,
            svgWidth = 740,
            svgHeight = 220,
            margin = {top: 60, right: 180, bottom: 20, left: 60},
            outerContainer = d3.select(containerSelector),
            svgContainer = setUpContainerGroups(outerContainer, svgWidth, svgHeight, margin),
            maxFoodPerDay = 2000,
            eaten = eatenData(food),
            // lines
            protLine, energyLine, defs;

        // scales and axes
        xScale = d3.scaleLinear().domain([0, maxFoodPerDay]).range([0, svgContainer.width]);
        xAxis = setUpXAxis(xScale, svgContainer);

        yScale = d3.scaleLinear().domain([0, 1.5]).range([svgContainer.height, 0]);
        yAxis = setUpYAxis(yScale, svgContainer);

        // clip paths, filters etc
        defs = createDefs(svgContainer.svg, containerSelector, xScale, yScale);

        // requirements group
        requirements = setUpRequirements(svgContainer, yScale);

        // data line and points
        energyLine = nutrientLine(svgContainer.lineContainer, 'kcal', '#808080',
                                  xScale, yScale, eaten, requirements,
                                  defs.plotClipPath.attr('id'));
        protLine = nutrientLine(svgContainer.lineContainer, 'prot', '#333333',
                                xScale, yScale, eaten, requirements,
                                defs.plotClipPath.attr('id'));


        // button
        btn = setUpButton(svgContainer.btnContainer, food, margin);

        // TODO move this to the button function
        btn.group.on('click', addFood);

        utls.setHidden({
            'toHide': [btn.verboseLabel, protLine.label, energyLine.label]
        })

        function updateBkgrRectangles (eaten, container, xScale, yScale, transDuration) {
            let rectWidth = xScale(100), //g
                rectHeight = yScale.range()[0],
                rectStroke = 'white',
                rectsNum = Math.ceil(eaten.grams / 100),
                data = d3.range(rectsNum).map(
                    d => eaten.grams >= 100 * (d + 1)? 100 : eaten.grams - d * 100
                ),
                rects = container.selectAll('rect').data(data);
                                 // .data(eaten.food.slice(2, eaten.food.length));
            rects.enter()
                 .append('rect')
                 .attr('x', (d, i) => i * rectWidth)
                 .attr('y', 0)
                 .attr('height', rectHeight)
                 .attr('width', 0)
                 .attr('stroke', rectStroke)
                 .attr('class', 'bckgr-rect')
                 // this is for the rectangles to have stroke only on sides and not top or buttom
                 .attr('stroke-dasharray', function (d) {
                     let width = xScale(d);
                     return `0, ${width}, ${rectHeight}, ${width}, ${rectHeight}`;
                 })
                 .transition()
                 .duration(transDuration)
                 .attr('width', xScale);
            rects.exit().remove();
        }

        function addFood () {
            if (requirements.achieved) {return};
            let transDuration = 250,
                defaultIncrement = 100;

            function nextProtValue () {
                return food.prot + eaten.prot;
            }

            function leftToProtNorm () {
                return (requirements.dailyNorm.prot - eaten.prot) / food.prot * 100;
            }

            let increment = nextProtValue() >= requirements.dailyNorm.prot?
                            leftToProtNorm() : defaultIncrement;

            utls.setHidden({
                'toHide': [btn.verboseLabel],
                'toShow': [protLine.label, energyLine.label],
            })

            eaten.addFood(increment);
            updateBkgrRectangles(eaten, svgContainer.bkgrContainer, xScale, yScale, transDuration);
            protLine.updateWithTransition(transDuration);
            energyLine.updateWithTransition(transDuration);

            let kg = Math.floor(eaten.grams / 1000);
            if (kg) {
                let newText = requirements.texts[
                    d3.min([kg - 1, requirements.texts.length - 1])
                ];
                requirements.setMultilineText(newText);
            }

            // had to do this because of float percision problems
            if ((requirements.dailyNorm.prot - eaten.prot) <= 0.01) {
                requirements.text.text('Єй! Доїлися');
                requirements.text.classed('bold', true);
                requirements.achieved = true;
                let totGrams = eaten.grams;
                requirements.totalGramEl = svgContainer.dailyReqContainer
                                                       .append('text')
                                                       .text(`${formatter(totGrams)} г`)
                                                       .attr('x', xScale(totGrams) + 5)
                                                       .attr('text-anchor', 'middle')
                                                       .attr('y', yScale.range()[0] + 16)
                                                       .attr('class', 'tail-label');
            };
        }

        function removeAllFood () {
            eaten.removeAllFood();
            requirements.setInitText();
            requirements.text.classed('bold', false);
            // hide background
            utls.setHidden({
                'toHide': [protLine.label, energyLine.label],
            });
            // this transition only works for points and not the lines
            protLine.updateWithTransition(100);
            energyLine.updateWithTransition(100);
            updateBkgrRectangles(eaten, svgContainer.bkgrContainer, xScale, yScale, 0);
            if (requirements.achieved) {
                requirements.totalGramEl.remove();
            }
            // TODO this should be calculated dynamically
            requirements.achieved = false;
        }
        return {
            requirements: requirements,
            removeAllFood: removeAllFood,
            updateXDomain: function (newMaxVal) {
                xAxis.changeDomain(newMaxVal);
            }
        }
    };
    return {
        nutPlot: nutPlot,
    }

};
