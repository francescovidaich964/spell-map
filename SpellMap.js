
var canvas = document.getElementById("SpellMap");
var ctx = canvas.getContext("2d");

console.clear();

var mouseX, mouseY;

// Spell filtering variables
var allSpells = []; // Store original spells
var filteredSpells = []; // Store filtered spells
var isFiltered = false;
var isTextInputFocused = false;

// Initialize allSpells with a copy of the original spells array
function initializeSpells() {
    allSpells = spells.map(spell => ({
        name: spell.name,
        school: spell.school,
        level: spell.level,
        x: spell.homeX,
        homeX: spell.homeX,
        y: spell.homeY,
        homeY: spell.homeY,
        r: spell.r,
        held: false,
        whitelist: [...spell.whitelist],
        token: false,
        highlight: false
    }));
}

// Function to filter spells based on provided list
function filterSpells(spellNames) {
    // Convert input to array and clean it
    const spellList = spellNames
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    
    if (spellList.length === 0) {
        resetSpells();
        return;
    }
    
    // Create filtered array
    filteredSpells = [];
    const foundSpells = [];
    
    // Find spells that match the input list
    spellList.forEach(inputName => {
        const foundSpell = allSpells.find(spell => 
            spell.name.toLowerCase() === inputName.toLowerCase()
        );
        if (foundSpell) {
            foundSpells.push(foundSpell);
        }
    });
    
    if (foundSpells.length === 0) {
        alert("No matching spells found!");
        return;
    }
    
    // Group by school and recalculate positions
    const spellsBySchool = {};
    foundSpells.forEach(spell => {
        if (!spellsBySchool[spell.school]) {
            spellsBySchool[spell.school] = [];
        }
        spellsBySchool[spell.school].push(spell);
    });
    
    // Reassign positions
    let currentIndex = 0;
    Object.keys(spellsBySchool).forEach(school => {
        spellsBySchool[school].forEach(spell => {
            const newSpell = {
                name: spell.name,
                school: spell.school,
                level: spell.level,
                x: spellX[currentIndex],
                homeX: spellX[currentIndex],
                y: spellY[currentIndex],
                homeY: spellY[currentIndex],
                r: 10,
                held: false,
                whitelist: [],
                token: false,
                highlight: false
            };
            filteredSpells.push(newSpell);
            currentIndex++;
        });
    });
    
    // Replace the global spells array
    spells = filteredSpells;
    isFiltered = true;
    
    console.log(`Filtered to ${spells.length} spells`);
}

// Function to reset to all spells
function resetSpells() {
    spells = allSpells.map(spell => ({
        name: spell.name,
        school: spell.school,
        level: spell.level,
        x: spell.homeX,
        homeX: spell.homeX,
        y: spell.homeY,
        homeY: spell.homeY,
        r: spell.r,
        held: false,
        whitelist: [...spell.whitelist],
        token: false,
        highlight: false
    }));
    isFiltered = false;
    console.log("Reset to all spells");
}


// Update your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    initializeSpells();
    
    const textInput = document.getElementById('spellFilterInput');
    
    // Focus event - disable spell map controls
    textInput.addEventListener('focus', function() {
        isTextInputFocused = true;
        console.log("Text input focused - spell map controls disabled");
    });
    
    // Blur event - re-enable spell map controls
    textInput.addEventListener('blur', function() {
        isTextInputFocused = false;
        console.log("Text input unfocused - spell map controls enabled");
    });
    
    document.getElementById('filterButton').addEventListener('click', function() {
        const input = document.getElementById('spellFilterInput').value;
        filterSpells(input);
    });
    
    document.getElementById('resetButton').addEventListener('click', function() {
        resetSpells();
        document.getElementById('spellFilterInput').value = '';
    });
    
    // Allow Enter key to apply filter (Ctrl+Enter for new line)
    document.getElementById('spellFilterInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.ctrlKey) {
            e.preventDefault();
            document.getElementById('filterButton').click();
        }
    });
});


var createCookie = function(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.setFullYear(expiration_date.getFullYear() + 1).toGMTString();
    } else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

var mode = "move";
var addSelect = "";
var originX = null;
var originY = null;
var xShift = [];
var yShift = [];

var preparedCount = 0;
var cantripCount = 0;
var tokenCount = 0;

var colors = new Map();

colors.set("Abjuration", "deepskyblue");
colors.set("Conjuration", "gold");
colors.set("Divination", "darkgrey");
colors.set("Enchantment", "hotpink");
colors.set("Evocation", "crimson");
colors.set("Illusion", "purple");
colors.set("Necromancy", "green");
colors.set("Transmutation", "tan");

var menuSchool = "Abjuration";

function spellDraw(spell) {
    ctx.beginPath();
    ctx.arc(spell.x, spell.y, spell.r, 0, 2 * Math.PI, false);
    ctx.fillStyle = colors.get(spell.school);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(spell.x + spell.r / 3, spell.y - spell.r / 3, spell.r / 3, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(spell.x + spell.r / 2, spell.y - spell.r / 2, spell.r / 7, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'white';
    ctx.fill();
    if (spell.token) {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.moveTo(spell.x, spell.y - 6);
        ctx.lineTo(spell.x + 5, spell.y - 3);
        ctx.lineTo(spell.x + 5, spell.y + 3);
        ctx.lineTo(spell.x, spell.y + 6);
        ctx.lineTo(spell.x - 5, spell.y + 3);
        ctx.lineTo(spell.x - 5, spell.y - 3);
        ctx.fill();
    }
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';

    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
}

function spellLabel(spell) {
    if (spell.highlight) ctx.fillStyle = 'blue';
    else ctx.fillStyle = 'white';
    
    ctx.font = "10px Verdana";
        ctx.textAlign = "center";
    wrapText(ctx,spell.name,spell.x,spell.y - 20,50,9);
    ctx.fillText("Lvl: " + spell.level, spell.x, spell.y + 20);
}


function button(x, y, w, h, school) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.school = school;
}

button.prototype.draw = function() {
    ctx.fillStyle = colors.get(this.school);
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.textAlign = "center";
    ctx.font = "bold 15px Verdana";
    ctx.fillStyle = "white";
    if (this.school == menuSchool) {
        ctx.font = "bold italic 15px Verdana";
    }
    ctx.fillText(this.school, this.x + this.w / 2, this.y + this.h * 3 / 4);
}

var buttons = [];
buttons[buttons.length] = new button(0, 575, 150, 25, "Abjuration");
buttons[buttons.length] = new button(150, 575, 150, 25, "Conjuration");
buttons[buttons.length] = new button(300, 575, 150, 25, "Divination");
buttons[buttons.length] = new button(450, 575, 150, 25, "Enchantment");
buttons[buttons.length] = new button(600, 575, 150, 25, "Evocation");
buttons[buttons.length] = new button(750, 575, 150, 25, "Illusion");
buttons[buttons.length] = new button(900, 575, 150, 25, "Necromancy");
buttons[buttons.length] = new button(1050, 575, 150, 25, "Transmutation");

setInterval(draw, 1);

function draw() {
    ctx.fillStyle = "#555";
    ctx.fillRect(0, 0, 1200, 980);

    //ctx.fillStyle = "#888";
    //ctx.fillRect(0, 900, 900, 300);
    
    ctx.fillStyle = "#333";
    for (i = 0; i < 9; i++) {
        ctx.beginPath();
        if (i % 2 == 0) {
            for (j = 0; j < 15; j++) { 
                ctx.arc(j * 80 + 40, i * 70 + 35, 2, 0, 2 * Math.PI, false);
            }
        } else {
            for (j = 0; j < 14; j++) { 
                ctx.arc(j * 80 + 80, i * 70 + 35, 2, 0, 2 * Math.PI, false);
            }
        }
        ctx.fill();
    }

    //ctx.globalAlpha = 0.1;
    //ctx.fillStyle = colors.get(menuSchool);
    //ctx.fillRect(0, 900, 900, 300);
    //ctx.globalAlpha = 1;

    ctx.fillStyle = "orange";
    ctx.fillRect(1145, 5, 50, 50);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(1150, 10);
    ctx.lineTo(1190, 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1150, 50);
    ctx.lineTo(1190, 10);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";

    preparedCount = 0;
    cantripCount = 0;
    tokenCount = 0;

    for (i = 0; i < spells.length; i++) {
        if (spells[i].y < 600) {
            if (spells[i].level > 0) preparedCount++;
            else cantripCount++;
            if (spells[i].token) tokenCount++;
            for (j = 0; j < spells.length; j++) {
                if (spells[j].y < 600 && spells[i].whitelist.indexOf(spells[j].name) >= 0) {
                    ctx.beginPath();
                    ctx.moveTo(spells[i].x, spells[i].y);
                    ctx.lineTo(spells[j].x, spells[j].y);
                    ctx.stroke();
                }
            }
        }
    }


    for (i = 0; i < spells.length; i++) {
        if (spells[i].name == addSelect) {
            ctx.strokeStyle = "forestgreen";
            ctx.beginPath();
            ctx.moveTo(spells[i].x, spells[i].y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
            ctx.strokeStyle = "black";
        }
    }

    ctx.fillStyle = "white";
    ctx.font = "bold 12px Verdana";
    ctx.textAlign = "left";
    ctx.fillText("Spells prepared: " + preparedCount, 5, 15);
    ctx.fillText("Cantrips known: " + cantripCount, 5, 30);
    ctx.fillText("Token Count: " + tokenCount, 5, 45);

    for (i = 0; i < buttons.length; i++) {
        buttons[i].draw();
    }

    for (i = 0; i < spells.length; i++) {
        if (spells[i].y < 600 && !spells[i].held) {
            spells[i].y = Math.round((spells[i].y - 17) / 70) * 70 + 35;
            if (Math.round((spells[i].y - 17) / 70) % 2 == 0) spells[i].x = Math.round((spells[i].x - 40) / 80) * 80 + 40;
            else spells[i].x = Math.round((spells[i].x - 20) / 80) * 80;
        }
        if (spells[i].y < 600 || spells[i].school == menuSchool || spells[i].held || spells[i].highlight) spellDraw(spells[i]);
    }

    for (i = 0; i < spells.length; i++) {
        if (spells[i].y < 600 || spells[i].school == menuSchool || spells[i].held || spells[i].highlight) spellLabel(spells[i]);
    }

    if (mode == "move") {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mouseX - 6, mouseY - 6);
        ctx.lineTo(mouseX + 6, mouseY + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 6, mouseY - 6);
        ctx.lineTo(mouseX - 6, mouseY + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX - 1, mouseY - 6);
        ctx.lineTo(mouseX - 6, mouseY - 6);
        ctx.lineTo(mouseX - 6, mouseY - 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 1, mouseY - 6);
        ctx.lineTo(mouseX + 6, mouseY - 6);
        ctx.lineTo(mouseX + 6, mouseY - 1);
        ctx.stroke();
        ctx.moveTo(mouseX - 1, mouseY + 6);
        ctx.lineTo(mouseX - 6, mouseY + 6);
        ctx.lineTo(mouseX - 6, mouseY + 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 1, mouseY + 6);
        ctx.lineTo(mouseX + 6, mouseY + 6);
        ctx.lineTo(mouseX + 6, mouseY + 1);
        ctx.stroke();
        ctx.lineWidth = 1;
    } else if (mode == "highlight") {
        ctx.strokeStyle = "blue";
        if (originX != null) {
            ctx.fillStyle = "rgba(0,0,255,0.25)";
            ctx.fillRect(originX, originY, mouseX - originX, mouseY - originY);
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(originX, mouseY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(mouseX, originY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(mouseX, originY);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(originX, mouseY);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
        }
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mouseX - 6, mouseY - 6);
        ctx.lineTo(mouseX + 6, mouseY + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 6, mouseY - 6);
        ctx.lineTo(mouseX - 6, mouseY + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX - 1, mouseY - 6);
        ctx.lineTo(mouseX - 6, mouseY - 6);
        ctx.lineTo(mouseX - 6, mouseY - 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 1, mouseY - 6);
        ctx.lineTo(mouseX + 6, mouseY - 6);
        ctx.lineTo(mouseX + 6, mouseY - 1);
        ctx.stroke();
        ctx.moveTo(mouseX - 1, mouseY + 6);
        ctx.lineTo(mouseX - 6, mouseY + 6);
        ctx.lineTo(mouseX - 6, mouseY + 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 1, mouseY + 6);
        ctx.lineTo(mouseX + 6, mouseY + 6);
        ctx.lineTo(mouseX + 6, mouseY + 1);
        ctx.stroke();
        ctx.lineWidth = 1;
    } else if (mode == "add") {
        ctx.strokeStyle = "forestgreen";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(mouseX, mouseY - 7);
        ctx.lineTo(mouseX, mouseY + 7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 7, mouseY);
        ctx.lineTo(mouseX - 7, mouseY);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
    } else if (mode == "delete") {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(mouseX - 7, mouseY - 7);
        ctx.lineTo(mouseX + 7, mouseY + 7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 7, mouseY - 7);
        ctx.lineTo(mouseX - 7, mouseY + 7);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
    } else {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.moveTo(mouseX, mouseY - 5);
        ctx.lineTo(mouseX, mouseY - 7);
        ctx.lineTo(mouseX + 6, mouseY - 4);
        ctx.lineTo(mouseX + 6, mouseY + 4);
        ctx.lineTo(mouseX, mouseY + 7);
        ctx.lineTo(mouseX, mouseY + 5);
        ctx.lineTo(mouseX + 4, mouseY + 3);
        ctx.lineTo(mouseX + 4, mouseY - 3);
        ctx.fill();

        ctx.moveTo(mouseX, mouseY - 5);
        ctx.lineTo(mouseX, mouseY - 7);
        ctx.lineTo(mouseX - 6, mouseY - 4);
        ctx.lineTo(mouseX - 6, mouseY + 4);
        ctx.lineTo(mouseX, mouseY + 7);
        ctx.lineTo(mouseX, mouseY + 5);
        ctx.lineTo(mouseX - 4, mouseY + 3);
        ctx.lineTo(mouseX - 4, mouseY - 3);
        ctx.fill();
    }
}

document.onmousemove = function(e) {
    e = window.event || e;

    rect = canvas.getBoundingClientRect();
    mouseX = Math.round((e.clientX - rect.left));
    mouseY = Math.round((e.clientY - rect.top));

    for (i = 0; i < spells.length; i++) {
        if (spells[i].held) {
            var highlightMoved = 0;
            if (spells[i].highlight) {
                for (j = spells.length - 1; j >= 0; j--) {
                    if (spells[j].highlight) {
                        spells[j].x = mouseX + xShift[highlightMoved];
                        spells[j].y = mouseY + yShift[highlightMoved];
                        highlightMoved++;
                        if (highlightMoved == xShift.length) break;
                    }
                }
            } else {
                spells[i].x = mouseX;
                spells[i].y = mouseY;
            }
            break;
        }
        if (mode == "highlight" && originX != null) {
            var x1 = Math.min(originX, mouseX);
            var y1 = Math.min(originY, mouseY);
            var x2 = Math.max(originX, mouseX);
            var y2 = Math.max(originY, mouseY);
            if (spells[i].x > x1 && spells[i].x < x2 && spells[i].y > y1 && spells[i].y < y2 && (spells[i].y < 440 || spells[i].school == menuSchool)) spells[i].highlight = true;
            else spells[i].highlight = false;
        }
    }
}

document.onmousedown = function(e) {
    e = window.event || e;
    var onSpell = false;
    for (i = spells.length - 1; i >= 0; i--) {
        if (Math.pow(Math.pow(mouseX - spells[i].x, 2) + Math.pow(mouseY - spells[i].y, 2), 0.5) < spells[i].r && (spells[i].y < 500 || spells[i].school == menuSchool)) {
            onSpell = true;
            if (mode == "move") {
                if (spells[i].highlight) {
                    originX = spells[i].x;
                    originY = spells[i].y;
                    for (j = spells.length - 1; j >= 0; j--) {
                        if (spells[j].highlight) {
                            xShift[xShift.length] = spells[j].x - originX;
                            yShift[yShift.length] = spells[j].y - originY;
                        }
                    }
                } else {
                    for (j = spells.length - 1; j >= 0; j--) {
                        spells[j].highlight = false;
                    }
                }
                spells[i].held = true;
            } else if (mode == "add" && spells[i].y < 600) {
                if (addSelect == "") addSelect = spells[i].name;
                else if (spells[i].name == addSelect) addSelect = "";
                else {
                    if (spells[i].whitelist.indexOf(addSelect) < 0) {
                        for (j = spells.length - 1; j >= 0; j--) {
                            if (spells[j].name == addSelect) {
                                // Check if linking is allowed based on your rules
                                var canLink = false;
                                if (spells[i].level == spells[j].level) {
                                    // Same level spells can always be linked (any school)
                                    canLink = true;
                                } else if (spells[i].school == spells[j].school && Math.abs(spells[i].level - spells[j].level) == 1) {
                                    // Consecutive level spells can be linked only if same school
                                    canLink = true;
                                }

                                if (canLink) {
                                    spells[j].whitelist[spells[j].whitelist.length] = spells[i].name;
                                    spells[i].whitelist[spells[i].whitelist.length] = addSelect;
                                    addSelect = spells[i].name;
                                } else {
                                    addSelect = "";
                                }
                                break;
                            }
                        }
                    } else {
                        spells[i].whitelist.splice(spells[i].whitelist.indexOf(addSelect), 1);
                        for (j = spells.length - 1; j >= 0; j--) {
                            if (spells[j].name == addSelect) {
                                spells[j].whitelist.splice(spells[j].whitelist.indexOf(spells[i].name), 1);
                                break;
                            }
                        }
                        addSelect = "";
                    }
                }
            } else if (mode == "delete" && spells[i].y < 600) {
                // Delete all connections for this spell
                for (j = 0; j < spells.length; j++) {
                    var index = spells[j].whitelist.indexOf(spells[i].name);
                    if (index >= 0) {
                        spells[j].whitelist.splice(index, 1);
                    }
                }
                spells[i].whitelist = [];
            } else if (mode == "token" && spells[i].y < 600) {
                spells[i].token = !spells[i].token;
            }
            break;
        } else {
            if (mode == "highlight") {
                originX = mouseX;
                originY = mouseY;
                for (i = spells.length - 1; i >= 0; i--) {
                    spells[i].highlight = false;
                }
            }
            if (i == 0) {
                addSelect = "";
            }
        }
    }
    if (!onSpell) {
        for (j = spells.length - 1; j >= 0; j--) {
            spells[j].highlight = false;
        }
    }
    for (i = buttons.length - 1; i >= 0; i--) {
        if (mouseX > buttons[i].x && mouseX < buttons[i].x + buttons[i].w && mouseY > buttons[i].y && mouseY < buttons[i].y + buttons[i].h) {
            menuSchool = buttons[i].school
            break;
        }
    }
}


document.onmouseup = function(e) {
    e = window.event || e;

    for (i = 0; i < spells.length; i++) {
        if (spells[i].held) {
            spells[i].held = false;
            if (spells[i].highlight) {
                for (k = spells.length - 1; k >= 0; k--) {
                    if (spells[k].y > 600) {
                        spells[k].x = spells[k].homeX;
                        spells[k].y = spells[k].homeY;
                        spells[k].token = false;
                        spells[k].whitelist = [];
                        spells[k].highlight = false;
                        for (j = spells.length - 1; j >= 0; j--) {
                            if (spells[j].whitelist.indexOf(spells[k].name) >= 0) {
                                spells[j].whitelist.splice(spells[j].whitelist.indexOf(spells[k].name), 1);
                            }
                        }
                    }
                }
            } else if (spells[i].y > 600) {
                spells[i].x = spells[i].homeX;
                spells[i].y = spells[i].homeY;
                spells[i].token = false;
                spells[i].whitelist = [];
                for (j = spells.length - 1; j >= 0; j--) {
                    if (spells[j].whitelist.indexOf(spells[i].name) >= 0) {
                        spells[j].whitelist.splice(spells[j].whitelist.indexOf(spells[i].name), 1);
                    }
                }
            }
            break;
        }
    }
    if (mode == "move") {
        if (mouseX > 1145 && mouseX < 1195 && mouseY > 5 && mouseY < 55) {
            for (i = 0; i < spells.length; i++) {
                spells[i].token = false;
            }
        }
    }

    originX = null;
    originY = null;
    xShift = [];
    yShift = [];

}

document.onkeydown = function(e) {
    e = window.event || e;
    var key = e.keyCode;
    
    // Don't process spell map controls if text input is focused
    if (isTextInputFocused) {
        return; // Allow normal text input behavior - DON'T call preventDefault
    }
    
    // Only prevent default if we're handling spell map controls
    e.preventDefault(); 
    
    if (mode != "add" && key === 90) { //z
        mode = "add";
    } else if (mode == "add" && key === 90) {
        mode = "move";
        addSelect = "";
    }

    if (mode != "delete" && key === 88) { //x
        mode = "delete";
        addSelect = "";
    } else if (mode == "delete" && key === 88) {
        mode = "move";
        addSelect = "";
    }

    if (mode != "token" && key === 67) { //c
        mode = "token";
        addSelect = "";
    } else if (mode == "token" && key === 67) {
        mode = "move";
        addSelect = "";
    }

    if (mode != "highlight" && key === 86) { //v
        mode = "highlight";
        addSelect = "";
    } else if (mode == "highlight" && key === 86) {
        mode = "move";
        addSelect = "";
    }

    if (key === 83) { //s
        var usedSpells = [];
        for (i = 0; i < spells.length; i++) {
            if (spells[i].y < 440) {
                usedSpells[usedSpells.length] = spells[i];
            }
        }
        createCookie(window.prompt("What would you like to save this arrangement as (must use exact name to load)?"), JSON.stringify(usedSpells), false);
    } else if (key === 79) { //o
        usedSpells = JSON.parse(getCookie(window.prompt("What arrangement would you like to load (must use exact name to load)?")));
        for (i = 0; i < spells.length; i++) {
            var isUsed = false;
            for (j = 0; j < usedSpells.length; j++) {
                if (spells[i].name == usedSpells[j].name) {
                    spells[i] = usedSpells[j];
                    isUsed = true;
                    break;
                }
            }
            if (!isUsed) {
                spells[i].x = spells[i].homeX;
                spells[i].y = spells[i].homeY;
                spells[i].token = false;
                spells[i].highlight = false;
            }
        }
    } else if (key === 38) { //up
        for (i = 0; i < spells.length; i++) {
            if (spells[i].highlight) {
                spells[i].y -= 5;
            }
        }
    } else if (key === 40) { //down
        for (i = 0; i < spells.length; i++) {
            if (spells[i].highlight) {
                spells[i].y += 5;
            }
        }
    } else if (key === 37) { //left
        for (i = 0; i < spells.length; i++) {
            if (spells[i].highlight) {
                spells[i].x -= 5;
            }
        }
    } else if (key === 39) { //right
        for (i = 0; i < spells.length; i++) {
            if (spells[i].highlight) {
                spells[i].x += 5;
            }
        }
    }
}

document.onkeyup = function(e) {
    e = window.event || e;
    var key = e.keyCode;
}
