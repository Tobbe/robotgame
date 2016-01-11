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
var levels = [{}, {}, {}, {}, {}, {}];
levels[0].name = "1: Intro";
levels[0].field = [
    ['6-', 'E-', 'E-', 'E-', 'E-', 'C-'],
    ['7-', 'F-', 'F-', 'F-', 'F-', 'D-'],
    ['7-', 'FB', 'FA', 'FB', 'F-', 'D-'],
    ['7-', 'F-', 'F-', 'F-', 'F-', 'D-'],
    ['7-', 'F-', 'F-', 'F-', 'F-', 'D-'],
    ['3-', 'B-', 'B-', 'B-', 'B-', '9-']];
levels[0].items = [[], [], [], [], [], []];
levels[0].items[2][1] = {
        key: 'buttons',
        index: '0'
    };
levels[0].items[2][3] = {
        key: 'buttons',
        index: '1'
    };
levels[0].leds = [{on: false}, {on: false}];
levels[0].buttons = [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }, {
        controlls: {
            key: 'leds',
            index: 1
        }
    }];

levels[1].name = "2: Maze";
levels[1].field = [
    ['4A', '0-', '0-', '0-', '0-', '0-'],
    ['5-', '0-', '0-', '6-', 'C-', '0-'],
    ['3-', 'A-', 'A-', '9-', '1B', '0-'],
    ['0-', '0-', '0-', '0-', '0-', '0-'],
    ['0-', '0-', '0-', '0-', '0-', '0-'],
    ['0-', '0-', '0-', '0-', '0-', '0-']];
levels[1].items = [[], [], [], [], [], []];
levels[1].items[2][4] = {
        key: 'buttons',
        index: '0'
    };
levels[1].leds = [{on: false}];
levels[1].buttons = [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }];

levels[2].name = "3: Doors";
levels[2].field = [
    ['4-', '0-', '6-', 'AD', 'C-', '0-'],
    ['3B', 'AC', 'F-', 'AE', 'F-', 'C-'],
    ['0-', '0-', '3-', 'AF', '9-', '5-'],
    ['0-', '0-', '0-', '0-', '0-', '5-'],
    ['0-', '0-', '0-', '0-', '0-', '5-'],
    ['0-', '0-', '0-', '0-', '0-', '1B']];
levels[2].items = [[], [], [], [], [], []];
levels[2].items[1][0] = {
        key: 'buttons',
        index: '0'
    };
levels[2].items[5][5] = {
        key: 'buttons',
        index: '1'
    };
levels[2].items[0][3] = {
        key: 'doors',
        index: 0
    };
levels[2].items[1][3] = {
        key: 'doors',
        index: 1
    };
levels[2].items[2][3] = {
        key: 'doors',
        index: 2
    };
levels[2].items[1][1] = {
        key: 'chests',
        index: 0
    };
levels[2].leds = [{on: false}, {on: false}];
levels[2].buttons = [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }, {
        controlls: {
            key: 'leds',
            index: 1
        }
    }];
levels[2].doors = [{open: false}, {open: false}, {open: false}];
levels[2].chests = [{open: false}];

levels[3].name = "4: Loop";
levels[3].field = [
    ['2B', 'C-', '0-', '0-', '0-', '0-'],
    ['0-', '3-', 'C-', '0-', '0-', '0-'],
    ['0-', '0-', '3-', 'C-', '0-', '0-'],
    ['0-', '0-', '0-', '3-', 'C-', '0-'],
    ['0-', '0-', '0-', '0-', '3-', 'C-'],
    ['0-', '0-', '0-', '0-', '0-', '1A']];
levels[3].items = [[], [], [], [], [], []];
levels[3].items[0][0] = {
        key: 'buttons',
        index: '0'
    };
levels[3].leds = [{on: false}];
levels[3].buttons = [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }];

levels[4].name = "5: Six instructions";
levels[4].field = [
    ['0-', '6-', 'A-', 'A-', 'A-', 'CB'],
    ['0-', '5-', '0-', '0-', '4-', '5-'],
    ['0-', '3-', 'C-', '6-', 'B-', 'D-'],
    ['0-', '0-', '7-', '9-', '0-', '5-'],
    ['6-', '8A', '5-', '6-', 'C-', '5-'],
    ['3-', 'A-', 'B-', '9-', '3-', '9-']];
levels[4].items = [[], [], [], [], [], []];
levels[4].items[0][5] = {
        key: 'buttons',
        index: '0'
    };
levels[4].leds = [{on: false}];
levels[4].buttons = [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }];

levels[5].name = "6: Conditional loop";
levels[5].field = [
    ['4A', '0-', '0-', '0-', '0-', '0-'],
    ['3-', 'C-', '6-', '8-', '0-', '0-'],
    ['0-', '3-', 'D-', '0-', '6-', '8B'],
    ['0-', '0-', '3-', 'C-', '5-', '0-'],
    ['0-', '0-', '0-', '3-', '9-', '0-'],
    ['0-', '0-', '0-', '0-', '0-', '0-']];
levels[5].items = [[], [], [], [], [], []];
levels[5].items[2][5] = {
        key: 'buttons',
        index: '0'
    };
levels[5].leds = [{on: false}];
levels[5].buttons = [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }];
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
