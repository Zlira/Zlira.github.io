'use strict';

let steak = {
        prot: 21,//33.56,
        kcal:  160, //223,
        name: "м'яса"
    },
    broccoli = {
        prot: 2.84,
        kcal: 34,
        name: 'броколят'
    },
    utls = utils(),
    np = nutPlot();

let steakPlot = np.nutPlot(steak, '#meat'),
    brocPlot = np.nutPlot(broccoli, '#broccoli');

allFoods();

d3.select('#user-weight').on('input', updateRequirements);
updateRequirements();

function updateRequirements () {
    let protPerKg = .8,
        formatter = utls.locale.format(',.1f'),
        input = d3.select('#user-weight').node();
    if (input.checkValidity()) {
        let protNorm = protPerKg * input.value;
        d3.select('#user-protein').html(formatter(protNorm));
        steakPlot.requirements.changeProtNorm(protNorm);
        steakPlot.removeAllFood();
        brocPlot.requirements.changeProtNorm(protNorm);
        brocPlot.removeAllFood();

        // meat calculations
        let meatTotG = 100 * protNorm / steak.prot,
            meatEnergy = meatTotG / 100 * steak.kcal,
            meatPercentEnergy = meatEnergy / 2000 * 100,
            brocoliTotG = 100 * protNorm / broccoli.prot;

        d3.select('#meat-tot-grams').html(formatter(meatTotG));
        d3.select('#meat-tot-energy').html(formatter(meatEnergy));
        d3.select('#meat-percent-energy').html(Math.round(meatPercentEnergy));
        d3.select('#broccoli-tot-grams').html(formatter(brocoliTotG / 1000));

        let xScaleMax = d3.max([meatTotG + 500, brocoliTotG + 500, 2000]);
        steakPlot.updateXDomain(xScaleMax);
        brocPlot.updateXDomain(xScaleMax);
    }
}


// TODO maybe I don't need the hole lib for this shit
$(".bar").peity("bar");
