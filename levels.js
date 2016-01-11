/**
 * First position
 * 1 = Open top
 * 2 = Open right
 * 4 = Open down
 * 8 = Open left
 *
 * Second position
 * A = Start position
 * B = Button
 * C = Chest
 * D = Red Door
 * E = Green Door
 * F = Blue Door
 */
var levels = [];
levels.push({
    name: "1: Intro",
    field:[
        ['6-', 'E-', 'E-', 'E-', 'E-', 'C-'],
        ['7-', 'F-', 'F-', 'F-', 'F-', 'D-'],
        ['7-', 'FB', 'FA', 'FB', 'F-', 'D-'],
        ['7-', 'F-', 'F-', 'F-', 'F-', 'D-'],
        ['7-', 'F-', 'F-', 'F-', 'F-', 'D-'],
        ['3-', 'B-', 'B-', 'B-', 'B-', '9-']],
    items: [[], [], [], [], [], []],
    leds: [{on: false}, {on: false}],
    buttons: [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }, {
        controlls: {
            key: 'leds',
            index: 1
        }
    }]
});
levels[levels.length - 1].items[2][1] = {
    key: 'buttons',
    index: '0'
};
levels[levels.length - 1].items[2][3] = {
    key: 'buttons',
    index: '1'
};

levels.push({
    name: "2: Maze",
    field: [
        ['4A', '0-', '0-', '0-', '0-', '0-'],
        ['5-', '0-', '0-', '6-', 'C-', '0-'],
        ['3-', 'A-', 'A-', '9-', '1B', '0-'],
        ['0-', '0-', '0-', '0-', '0-', '0-'],
        ['0-', '0-', '0-', '0-', '0-', '0-'],
        ['0-', '0-', '0-', '0-', '0-', '0-']],
    items: [[], [], [], [], [], []],
    leds: [{on: false}],
    buttons: [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }]
});
levels[levels.length - 1].items[2][4] = {
    key: 'buttons',
    index: '0'
};

levels.push({
    name: "3: Doors",
    field: [
        ['4-', '0-', '6-', 'AD', 'C-', '0-'],
        ['3B', 'AC', 'F-', 'AE', 'F-', 'C-'],
        ['0-', '0-', '3-', 'AF', '9-', '5-'],
        ['0-', '0-', '0-', '0-', '0-', '5-'],
        ['0-', '0-', '0-', '0-', '0-', '5-'],
        ['0-', '0-', '0-', '0-', '0-', '1B']],
    items: [[], [], [], [], [], []],
    leds: [{on: false}, {on: false}],
    buttons: [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }, {
        controlls: {
            key: 'leds',
            index: 1
        }
    }],
    doors: [{open: false}, {open: false}, {open: false}],
    chests: [{open: false}]
});
levels[levels.length - 1].items[1][0] = {
    key: 'buttons',
    index: '0'
};
levels[levels.length - 1].items[5][5] = {
    key: 'buttons',
    index: '1'
};
levels[levels.length - 1].items[0][3] = {
    key: 'doors',
    index: 0
};
levels[levels.length - 1].items[1][3] = {
    key: 'doors',
    index: 1
};
levels[levels.length - 1].items[2][3] = {
    key: 'doors',
    index: 2
};
levels[levels.length - 1].items[1][1] = {
    key: 'chests',
    index: 0
};

levels.push({
    name: "4: Loop",
    field: [
        ['2B', 'C-', '0-', '0-', '0-', '0-'],
        ['0-', '3-', 'C-', '0-', '0-', '0-'],
        ['0-', '0-', '3-', 'C-', '0-', '0-'],
        ['0-', '0-', '0-', '3-', 'C-', '0-'],
        ['0-', '0-', '0-', '0-', '3-', 'C-'],
        ['0-', '0-', '0-', '0-', '0-', '1A']],
    items: [[], [], [], [], [], []],
    leds: [{on: false}],
    buttons: [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }]
});
levels[levels.length - 1].items[0][0] = {
    key: 'buttons',
    index: '0'
};

levels.push({
    name: "5: Six instructions",
    field: [
        ['0-', '6-', 'A-', 'A-', 'A-', 'CB'],
        ['0-', '5-', '0-', '0-', '4-', '5-'],
        ['0-', '3-', 'C-', '6-', 'B-', 'D-'],
        ['0-', '0-', '7-', '9-', '0-', '5-'],
        ['6-', '8A', '5-', '6-', 'C-', '5-'],
        ['3-', 'A-', 'B-', '9-', '3-', '9-']],
    items: [[], [], [], [], [], []],
    leds: [{on: false}],
    buttons: [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }]
});
levels[levels.length - 1].items[0][5] = {
    key: 'buttons',
    index: '0'
};

levels.push({
    name: "6: Conditional loop",
    field: [
        ['4A', '0-', '0-', '0-', '0-', '0-'],
        ['3-', 'C-', '6-', '8-', '0-', '0-'],
        ['0-', '3-', 'D-', '0-', '6-', '8B'],
        ['0-', '0-', '3-', 'C-', '5-', '0-'],
        ['0-', '0-', '0-', '3-', '9-', '0-'],
        ['0-', '0-', '0-', '0-', '0-', '0-']],
    items: [[], [], [], [], [], []],
    leds: [{on: false}],
    buttons: [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }]
});
levels[levels.length - 1].items[2][5] = {
    key: 'buttons',
    index: '0'
};

var currentLevel = -1;

function getCurrentLevel() {
    return levels[currentLevel];
}

function getLevel(index) {
    return levels[index];
}

function setCurrentLevelIndex(currentLevelIndex) {
    currentLevel = currentLevelIndex;
}

function getNextLevelName() {
    var nextLevel = currentLevel === levels.length -1 ?
        0 : currentLevel + 1;
    return levels[nextLevel].name;
}

function moveToNextLevel() {
    currentLevel++;

    if (currentLevel === levels.length) {
        currentLevel = 0;
    }
}
