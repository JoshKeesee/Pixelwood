$(".furnace").slideUp(0);
$(".chest").slideUp(0);

var allowedToMove = false;
var usingFurnace = false;
var usingChest = false;
var usingWorkbench = false;
var usingBackpack = false;
var collidingWithTree = false;

var CAMERAX = 0;
var CAMERAY = 0;
var CAMERAZOOM = 1;
var smoothing = 0.25;
var workbenchRecipes = {
  "wooden-pickaxe": ["stick", "stick", "stick", "", "stick", "", "", "stick", ""],
  "gold-pickaxe": ["gold", "gold", "gold", "", "stick", "", "", "stick", ""],
  "iron-pickaxe": ["iron", "iron", "iron", "", "stick", "", "", "stick", ""],
  "ruby-pickaxe": ["ruby", "ruby", "ruby", "", "stick", "", "", "stick", ""],
  "diamond-pickaxe": ["diamond", "diamond", "diamond", "", "stick", "", "", "stick", ""],
  "emerald-pickaxe": ["emerald", "emerald", "emerald", "", "stick", "", "", "stick", ""],
  "platinum-pickaxe": ["platinum", "platinum", "platinum", "", "stick", "", "", "stick", ""],
  "wooden-sword": ["", "stick", "", "", "stick", "", "", "stick", ""],
  "gold-sword": ["", "gold", "", "", "gold", "", "", "stick", ""],
  "iron-sword": ["", "iron", "", "", "iron", "", "", "stick", ""],
  "ruby-sword": ["", "ruby", "", "", "ruby", "", "", "stick", ""],
  "diamond-sword": ["", "diamond", "", "", "diamond", "", "", "stick", ""],
  "emerald-sword": ["", "emerald", "", "", "emerald", "", "", "stick", ""],
  "platinum-sword": ["", "platinum", "", "", "platinum", "", "", "stick", ""],
  "wooden-axe": ["", "stick", "stick", "", "stick", "stick", "", "stick", ""],
  "gold-axe": ["", "gold", "gold", "", "stick", "gold", "", "stick", ""],
  "iron-axe": ["", "iron", "iron", "", "stick", "iron", "", "stick", ""],
  "ruby-axe": ["", "ruby", "ruby", "", "stick", "ruby", "", "stick", ""],
  "diamond-axe": ["", "diamond", "diamond", "", "stick", "diamond", "", "stick", ""],
  "emerald-axe": ["", "emerald", "emerald", "", "stick", "emerald", "", "stick", ""],
  "platinum-axe": ["", "platinum", "platinum", "", "stick", "platinum", "", "stick", ""],
  "torch": ["", "coal", "", "", "stick", "", "", "stick", ""],
}

const playerLoop = () => {
  playerData = requestAnimationFrame(playerLoop);

  if (players[myId].devMode) {
    if (!movement.speed) {
      players[myId].speed = 3;
    } else {
      players[myId].speed = 6;
    }
  } else {
    players[myId].speed = 1.5;
  }

  CAMERAX += smoothing * ((players[myId].x - canvas.width / 2 + ((framewidth / 2) / scale)) - CAMERAX);
  CAMERAY += smoothing * ((players[myId].y - canvas.height / 2 + ((frameheight / 2) / scale)) - CAMERAY);

  if (scenes[players[myId].scene].type !== "house" && scenes[players[myId].scene].type !== "cave") {
    if (CAMERAX < 0) {
      CAMERAX = 0;
    }

    if (CAMERAX + canvas.width > scenes[players[myId].scene].width * grass.width) {
      CAMERAX = scenes[players[myId].scene].width * grass.width - canvas.width;
    }

    if (CAMERAY < 0) {
      CAMERAY = 0;
    }

    if (CAMERAY + canvas.height > scenes[players[myId].scene].height * grass.height) {
      CAMERAY = scenes[players[myId].scene].height * grass.height - canvas.height;
    }
  }

  players[myId].xVel *= 0.8;
  players[myId].yVel *= 0.8;

  players[myId].xVel = Math.trunc(players[myId].xVel * 10) / 10;
  players[myId].yVel = Math.trunc(players[myId].yVel * 10) / 10;

  players[myId].x += players[myId].xVel;
  players[myId].y += players[myId].yVel;

  players[myId].x = Math.trunc(players[myId].x * 10) / 10;
  players[myId].y = Math.trunc(players[myId].y * 10) / 10;

  if (movement.up) {
    players[myId].yVel -= players[myId].speed;
  }
  if (movement.down) {
    players[myId].yVel += players[myId].speed;
  }
  if (movement.left) {
    players[myId].xVel -= players[myId].speed;
  }
  if (movement.right) {
    players[myId].xVel += players[myId].speed;
  }

  $(".use").addClass("hidden");

  for (var i = 0; i < collisions.length; i++) {
    if (colliding(players[myId], collisions[i])) {
      if (collisions[i].type === "ladder" && players[myId].costumeY === 1) {
        $(".use").removeClass("hidden");
      }

      if (collisions[i].type === "bed") {
        $(".use").removeClass("hidden");
      }

      var hitForce = 0;

      if (players[myId].inventory[players[myId].spot - 1] === "wooden-pickaxe") {
        hitForce = 1;
      } else if (players[myId].inventory[players[myId].spot - 1] === "gold-pickaxe") {
        hitForce = 8;
      } else if (players[myId].inventory[players[myId].spot - 1] === "iron-pickaxe") {
        hitForce = 12;
      } else if (players[myId].inventory[players[myId].spot - 1] === "ruby-pickaxe") {
        hitForce = 24;
      } else if (players[myId].inventory[players[myId].spot - 1] === "diamond-pickaxe") {
        hitForce = 28;
      } else if (players[myId].inventory[players[myId].spot - 1] === "emerald-pickaxe") {
        hitForce = 50;
      } else if (players[myId].inventory[players[myId].spot - 1] === "platinum-pickaxe") {
        hitForce = 100;
      }

      if ((collisions[i].type === "iron" || collisions[i].type === "gold" || collisions[i].type === "emerald" || collisions[i].type === "diamond" || collisions[i].type === "ruby" || (collisions[i].type === "platinum" && players[myId].premiumUser) || collisions[i].type === "coal") && players[myId].inventory[players[myId].spot - 1].includes("pickaxe") && players[myId].useTool) {
        scenes[players[myId].scene].scenery[collisions[i].id].mining -= scenes[players[myId].scene].scenery[collisions[i].id].miningSpeed * hitForce;
        if (scenes[players[myId].scene].scenery[collisions[i].id].mining < 0 && !scenes[players[myId].scene].scenery[collisions[i].id].mined) {
          scenes[players[myId].scene].scenery[collisions[i].id].mining = 0;
          scenes[players[myId].scene].scenery[collisions[i].id].mined = true;
          for (var x = 0; x < players[myId].inventory.length; x++) {
            if (players[myId].inventory[x] === "") {
              players[myId].inventory[x] = collisions[i].type;
              break;
            }
            if (x === players[myId].inventory.length - 1) {
              for (var y = 0; y < players[myId].backpack.length; y++) {
                if (players[myId].backpack[y] === "") {
                  players[myId].backpack[y] = collisions[i].type;
                  break;
                }
              }
            }
          }

          updateBackpack();
        }
        socket.emit("updateOres", [scenes[players[myId].scene].scenery[collisions[i].id], collisions[i].id]);
      } else if (collisions[i].type === "iron" || collisions[i].type === "gold" || collisions[i].type === "emerald" || collisions[i].type === "diamond" || collisions[i].type === "ruby" || (collisions[i].type === "platinum" && players[myId].premiumUser) || collisions[i].type === "coal") {
        if (!scenes[players[myId].scene].scenery[collisions[i].id].mined) {
          for (var x = 0; x < Object.keys(players).length; x++) {
            const player = players[Object.keys(players)[x]];

            if (colliding(player, collisions[i]) && player.id !== myId) break;

            if (x === Object.keys(players).length - 1) {
              scenes[players[myId].scene].scenery[collisions[i].id].mining = 1;
              socket.emit("updateOres", [scenes[players[myId].scene].scenery[collisions[i].id], collisions[i].id]);
            }
          };
        }
      }

      var hitForce = 0;

      if (players[myId].inventory[players[myId].spot - 1] === "wooden-sword") {
        hitForce = 2;
      } else if (players[myId].inventory[players[myId].spot - 1] === "gold-sword") {
        hitForce = 3;
      } else if (players[myId].inventory[players[myId].spot - 1] === "iron-sword") {
        hitForce = 4;
      } else if (players[myId].inventory[players[myId].spot - 1] === "ruby-sword") {
        hitForce = 6;
      } else if (players[myId].inventory[players[myId].spot - 1] === "diamond-sword") {
        hitForce = 8;
      } else if (players[myId].inventory[players[myId].spot - 1] === "emerald-sword") {
        hitForce = 10;
      } else if (players[myId].inventory[players[myId].spot - 1] === "platinum-sword") {
        hitForce = 20;
      }

      if (collisions[i].type === "player" && (players[myId].inventory[players[myId].spot - 1].includes("sword")) && players[myId].useTool) {
        if (players[myId].costumeY === 0) {
          players[collisions[i].id].yVel += 10;
        } else if (players[myId].costumeY === 1) {
          players[collisions[i].id].yVel -= 10;
        } else if (players[myId].costumeY === 2) {
          players[collisions[i].id].xVel -= 10;
        } else if (players[myId].costumeY === 3) {
          players[collisions[i].id].xVel += 10;
        }
        players[collisions[i].id].health -= hitForce;

        socket.emit("hitPlayer", [players[collisions[i].id], collisions[i].id]);
      }

      var hitForce = 0;

      if (players[myId].inventory[players[myId].spot - 1] === "") {
        hitForce = 1 / 8;
        if (collisions[i].type === "tree" || collisions[i].type === "small-tree") {
          collidingWithTree = true;
        }
      } else if (players[myId].inventory[players[myId].spot - 1] === "wooden-axe") {
        hitForce = 1 / 4;
      } else if (players[myId].inventory[players[myId].spot - 1] === "gold-axe") {
        hitForce = 1 / 2;
      } else if (players[myId].inventory[players[myId].spot - 1] === "iron-axe") {
        hitForce = 3 / 4;
      } else if (players[myId].inventory[players[myId].spot - 1] === "ruby-axe") {
        hitForce = 1;
      } else if (players[myId].inventory[players[myId].spot - 1] === "diamond-axe") {
        hitForce = 1 + 1 / 4;
      } else if (players[myId].inventory[players[myId].spot - 1] === "emerald-axe") {
        hitForce = 1 + 1 / 2;
      } else if (players[myId].inventory[players[myId].spot - 1] === "platinum-axe") {
        hitForce = 2 + 1 / 2;
      }

      if ((collisions[i].type === "tree" || collisions[i].type === "small-tree") && (players[myId].inventory[players[myId].spot - 1].includes("axe") || players[myId].inventory[players[myId].spot - 1] === "") && players[myId].useTool) {
        scenes[players[myId].scene].scenery[collisions[i].id].mining -= scenes[players[myId].scene].scenery[collisions[i].id].miningSpeed * hitForce;
        if (scenes[players[myId].scene].scenery[collisions[i].id].mining < 0 && !scenes[players[myId].scene].scenery[collisions[i].id].mined) {
          scenes[players[myId].scene].scenery[collisions[i].id].mining = 0;
          scenes[players[myId].scene].scenery[collisions[i].id].mined = true;
          for (var x = 0; x < players[myId].inventory.length; x++) {
            if (players[myId].inventory[x] === "") {
              players[myId].inventory[x] = "stick";
              break;
            }
            if (x === players[myId].inventory.length - 1) {
              for (var y = 0; y < players[myId].backpack.length; y++) {
                if (players[myId].backpack[y] === "") {
                  players[myId].backpack[y] = "stick";
                  break;
                }
              }
            }
          }

          updateBackpack();
        }
        socket.emit("updateTrees", [scenes[players[myId].scene].scenery[collisions[i].id], collisions[i].id]);
      } else if (collisions[i].type === "tree" || collisions[i].type === "small-tree") {
        if (!scenes[players[myId].scene].scenery[collisions[i].id].mined) {
          for (var x = 0; x < Object.keys(players).length; x++) {
            const player = players[Object.keys(players)[x]];

            if (colliding(player, collisions[i]) && player.id !== myId) break;

            if (x === Object.keys(players).length - 1) {
              scenes[players[myId].scene].scenery[collisions[i].id].mining = 1;
              socket.emit("updateTrees", [scenes[players[myId].scene].scenery[collisions[i].id], collisions[i].id]);
            }
          };
        }
      }

      if (collisions[i].type !== "ladder" && collisions[i].type !== "exit" && collisions[i].type !== "bed" && collisions[i].type !== "change" && collisions[i].type !== "tree" && collisions[i].type !== "small-tree" && collisions[i].type !== "player") {
        if (colT(players[myId], collisions[i])) {
          players[myId].y = collisions[i].y - (frameheight / scale) - 2;
          if ((collisions[i].type === "furnace" || collisions[i].type === "chest" || collisions[i].type === "workbench") && players[myId].costumeY === 0) {
            players[myId].y = collisions[i].y - (frameheight / scale);
            $(".use").removeClass("hidden");
            if (movement.use && collisions[i].type === "furnace" && !players[myId].chestOpen) {
              toggleFurnace();
            } else if (movement.use && collisions[i].type === "chest") {
              toggleChest();
            } else if (movement.use && collisions[i].type === "workbench") {
              toggleWorkbench();
            }
          } else if (collisions[i].type === "iron" || collisions[i].type === "gold" || collisions[i].type === "emerald" || collisions[i].type === "diamond" || collisions[i].type === "ruby" || collisions[i].type === "coal" || collisions[i].type === "platinum") {
            players[myId].y = collisions[i].y - (frameheight / scale);
          }
        }

        if (colB(players[myId], collisions[i])) {
          players[myId].y = collisions[i].y + collisions[i].h + 2;
          if ((collisions[i].type === "furnace" || collisions[i].type === "chest" || collisions[i].type === "workbench") && players[myId].costumeY === 1) {
            players[myId].y = collisions[i].y + collisions[i].h;
            $(".use").removeClass("hidden");
            if (movement.use && collisions[i].type === "furnace" && !players[myId].chestOpen) {
              toggleFurnace();
            } else if (movement.use && collisions[i].type === "chest") {
              toggleChest();
            } else if (movement.use && collisions[i].type === "workbench") {
              toggleWorkbench();
            }
          } else if (collisions[i].type === "iron" || collisions[i].type === "gold" || collisions[i].type === "emerald" || collisions[i].type === "diamond" || collisions[i].type === "ruby" || collisions[i].type === "coal" || collisions[i].type === "platinum") {
            players[myId].y = collisions[i].y + collisions[i].h;
          }
        }

        if (colR(players[myId], collisions[i])) {
          players[myId].x = collisions[i].x + collisions[i].w + 2;
          if ((collisions[i].type === "furnace" || collisions[i].type === "chest" || collisions[i].type === "workbench") && players[myId].costumeY === 2) {
            players[myId].x = collisions[i].x + collisions[i].w;
            $(".use").removeClass("hidden");
            if (movement.use && collisions[i].type === "furnace" && !players[myId].chestOpen) {
              toggleFurnace();
            } else if (movement.use && collisions[i].type === "chest") {
              toggleChest();
            } else if (movement.use && collisions[i].type === "workbench") {
              toggleWorkbench();
            }
          } else if (collisions[i].type === "iron" || collisions[i].type === "gold" || collisions[i].type === "emerald" || collisions[i].type === "diamond" || collisions[i].type === "ruby" || collisions[i].type === "coal" || collisions[i].type === "platinum") {
            players[myId].x = collisions[i].x + collisions[i].w;
          }
        }

        if (colL(players[myId], collisions[i])) {
          players[myId].x = collisions[i].x - (framewidth / scale) - 2;
          if ((collisions[i].type === "furnace" || collisions[i].type === "chest" || collisions[i].type === "workbench") && players[myId].costumeY === 3) {
            players[myId].x = collisions[i].x - (framewidth / scale);
            $(".use").removeClass("hidden");
            if (movement.use && collisions[i].type === "furnace" && !(players[myId].chestOpen || usingChest || usingBackpack || usingWorkbench)) {
              toggleFurnace();
            } else if (movement.use && collisions[i].type === "chest" && !(usingWorkbench || usingBackpack || usingFurnace)) {
              toggleChest();
            } else if (movement.use && collisions[i].type === "workbench" && !(players[myId].chestOpen || usingChest || usingBackpack || usingFurnace)) {
              toggleWorkbench();
            }
          } else if (collisions[i].type === "iron" || collisions[i].type === "gold" || collisions[i].type === "emerald" || collisions[i].type === "diamond" || collisions[i].type === "ruby" || collisions[i].type === "coal" || collisions[i].type === "platinum") {
            players[myId].x = collisions[i].x - (framewidth / scale);
          }
        }
      } else if (collisions[i].type === "bed" && movement.use && !players[myId].inBed) {
        getInBed(collisions[i]);
      } else if (collisions[i].type === "change") {
        players[myId].scene = collisions[i].toScene;
        players[myId].x = collisions[i].toX;
        players[myId].y = collisions[i].toY;
        CAMERAX += (players[myId].x - canvas.width / 2 + ((framewidth / 2) / scale)) - CAMERAX;
        CAMERAY += (players[myId].y - canvas.height / 2 + ((frameheight / 2) / scale)) - CAMERAY;
        transitionScene(300);
      } else if ((movement.use && collisions[i].type === "ladder" && players[myId].costumeY === 1) || ((movement.down || movement.up) && collisions[i].type === "exit")) {
        var oldScene = players[myId].scene;
        players[myId].scene = collisions[i].toScene;
        players[myId].x = collisions[i].toX;
        players[myId].y = collisions[i].toY;
        if (collisions[i].toScene === 0 && oldScene === 1) {
          players[myId].x = 2500 + house.width / 2 - (framewidth / scale) / 2 - 12;
          players[myId].y = 100 + house.height - 260 + framewidth / scale;
        } else if (collisions[i].toScene === 0 && oldScene === 5) {
          players[myId].x = 1300 + house.width / 2 - (framewidth / scale) / 2 - 12;
          players[myId].y = 100 + house.height - 260 + framewidth / scale;
        } else if (collisions[i].toScene === 1 && players[myId].scene === 0) {
          players[myId].x = (scenes[players[myId].scene].width - 1) * plank.width + (plank.width / 2) - (framewidth / scale / 2);
          players[myId].y = (scenes[players[myId].scene].height - 1) * plank.height;
        }
        CAMERAX += (players[myId].x - canvas.width / 2 + ((framewidth / 2) / scale)) - CAMERAX;
        CAMERAY += (players[myId].y - canvas.height / 2 + ((frameheight / 2) / scale)) - CAMERAY;
        transitionScene(300);
      }
    }
  }

  movement.use = false;

  if (players[myId].x < 0) {
    players[myId].x = 0;
    players[myId].xVel = 0;
  }

  if (players[myId].y < 0) {
    players[myId].y = 0;
    players[myId].yVel = 0;
  }

  if (players[myId].x + (framewidth / scale) > scenes[players[myId].scene].width * grass.width) {
    players[myId].x = scenes[players[myId].scene].width * grass.width - (framewidth / scale);
    players[myId].xVel = 0;
  }

  if (players[myId].y + (frameheight / scale) > scenes[players[myId].scene].height * grass.height) {
    players[myId].y = scenes[players[myId].scene].height * grass.height - (frameheight / scale);
    players[myId].yVel = 0;
  }

  if (players[myId].inventory[players[myId].spot - 1] === "torch" && players[myId].useTool) {
    players[myId].torch += smoothing * (1000 - players[myId].torch);
  } else {
    players[myId].torch += smoothing * (500 - players[myId].torch);
  }

  players[myId].torch = Math.trunc(players[myId].torch);

  if (players[myId].inventory[players[myId].spot - 1] !== "" && !easterEgg) {
    $(".usetool").removeClass("hidden");

    $(".usetool .text").html("USE " + players[myId].inventory[players[myId].spot - 1].toUpperCase() + "(Z)");
  } else if (collidingWithTree) {
    $(".usetool").removeClass("hidden");

    $(".usetool .text").html("PUNCH TREE(Z)");

    collidingWithTree = false;
  } else if (easterEgg) {
    $(".usetool").removeClass("hidden");
  } else {
    $(".usetool").addClass("hidden");
  }

  if (usingChest || usingFurnace || usingWorkbench || usingBackpack) {
    $(".use .text").html("CLOSE(X)");
  } else {
    $(".use .text").html("USE(X)");
  }

  if (movement.zoom) {
    CAMERAZOOM += 0.2 * (0.7 - CAMERAZOOM);
  } else {
    CAMERAZOOM += 0.2 * (1 - CAMERAZOOM);
  }

  if (movement.down) {
    players[myId].costumeY = 0;
  } else if (movement.up) {
    players[myId].costumeY = 1;
  } else if (movement.left) {
    players[myId].costumeY = 2;
  } else if (movement.right) {
    players[myId].costumeY = 3;
  }
};

const loopFrames = () => {
  if (movement.up || movement.down || movement.left || movement.right) {
    players[myId].currFrame++;

    if (players[myId].currFrame > 3) {
      players[myId].currFrame = 0;
    }
  } else {
    players[myId].currFrame = 0;
  }

  if (players[myId].health <= 0) {
    socket.emit("respawn");
    players[socket.id] = {
      x: 5 * 200 - 400 / 4,
      y: 0,
      xVel: 0,
      yVel: 0,
      w: 100,
      h: 125,
      health: 100,
      kills: players[socket.id].kills,
      lastTouched: null,
      speed: 1,
      scene: 1,
      cutScene: players[socket.id].cutScene,
      id: socket.id,
      currFrame: 0,
      costumeY: 0,
      inBed: false,
      chestOpen: false,
      useTool: false,
      torch: 0,
      rotate: 0,
      spot: players[socket.id].spot,
      inventory: players[socket.id].inventory,
      backpack: players[socket.id].backpack,
      dbId: players[socket.id].dbId,
      name: players[socket.id].name,
      devMode: false,
      ready: true,
    };
  }
};

function toggleFurnace() {
  allowedToMove = !allowedToMove;
  usingFurnace = !usingFurnace;
  $(".furnace").slideToggle(200);
}

function toggleChest() {
  players[myId].chestOpen = !players[myId].chestOpen;
  allowedToMove = !allowedToMove;
  usingChest = !usingChest;
  $(".chest").slideToggle(200);
}

function toggleWorkbench() {
  allowedToMove = !allowedToMove;
  usingWorkbench = !usingWorkbench;
  $(".workbench").slideToggle(200);
}

function toggleBackpack() {
  allowedToMove = !allowedToMove;
  usingBackpack = !usingBackpack;
  $(".backpack").slideToggle(200);
  saveGame();
}

function updateBackpack() {
  for (var i = 0; i < document.querySelectorAll(".backpack .item").length; i++) {
    if (players[myId].backpack[i] !== "") {
      document.querySelectorAll(".backpack .item")[i].innerHTML = "<img id='" + players[myId].backpack[i] + "' src='" + items[players[myId].backpack[i]].src + "'>";
    } else {
      document.querySelectorAll(".backpack .item")[i].innerHTML = "";
    }
  }
}

function selectItemFromChest(item) {
  var originalItem = players[myId].inventory[players[myId].spot - 1];
  if (document.getElementById(item).innerHTML === "") {
    document.getElementById(item).innerHTML = "<img id='" + players[myId].inventory[players[myId].spot - 1] + "' src='" + items[players[myId].inventory[players[myId].spot - 1]].src + "'>";
    players[myId].inventory[players[myId].spot - 1] = "";
  } else {
    if (players[myId].inventory[players[myId].spot - 1] === "") {
      players[myId].inventory[players[myId].spot - 1] = document.getElementById(item).firstChild.id;
      document.getElementById(item).innerHTML = "";
    } else {
      players[myId].inventory[players[myId].spot - 1] = document.getElementById(item).firstChild.id;
      document.getElementById(item).innerHTML = "<img id='" + originalItem + "' src='" + items[originalItem].src + "'>";
    }
  }

  for (var i = 0; i < document.querySelectorAll(".chest .item").length; i++) {
    if (document.querySelectorAll(".chest .item")[i].innerHTML !== "") {
      chestItems[i] = document.querySelectorAll(".chest .item")[i].firstChild.id;
    } else {
      chestItems[i] = "";
    }
  }

  if (connected) {
    socket.emit("chestItems", chestItems);
  }
}

function selectItemFromBackpack(item) {
  var originalItem = players[myId].inventory[players[myId].spot - 1];
  if (document.getElementById(item).innerHTML === "") {
    document.getElementById(item).innerHTML = "<img id='" + players[myId].inventory[players[myId].spot - 1] + "' src='" + items[players[myId].inventory[players[myId].spot - 1]].src + "'>";
    players[myId].inventory[players[myId].spot - 1] = "";
  } else {
    if (players[myId].inventory[players[myId].spot - 1] === "") {
      players[myId].inventory[players[myId].spot - 1] = document.getElementById(item).firstChild.id;
      document.getElementById(item).innerHTML = "";
    } else {
      players[myId].inventory[players[myId].spot - 1] = document.getElementById(item).firstChild.id;
      document.getElementById(item).innerHTML = "<img id='" + originalItem + "' src='" + items[originalItem].src + "'>";
    }
  }

  for (var i = 0; i < document.querySelectorAll(".backpack .item").length; i++) {
    if (document.querySelectorAll(".backpack .item")[i].innerHTML !== "") {
      players[myId].backpack[i] = document.querySelectorAll(".backpack .item")[i].firstChild.id;
    } else {
      players[myId].backpack[i] = "";
    }
  }
}

function selectItemFromWorkbench(item) {
  var originalItem = players[myId].inventory[players[myId].spot - 1];
  if (document.getElementById(item).innerHTML === "") {
    document.getElementById(item).innerHTML = "<img id='" + players[myId].inventory[players[myId].spot - 1] + "' src='" + items[players[myId].inventory[players[myId].spot - 1]].src + "'>";
    players[myId].inventory[players[myId].spot - 1] = "";
  } else {
    if (players[myId].inventory[players[myId].spot - 1] === "") {
      players[myId].inventory[players[myId].spot - 1] = document.getElementById(item).firstChild.id;
      document.getElementById(item).innerHTML = "";
    } else {
      players[myId].inventory[players[myId].spot - 1] = document.getElementById(item).firstChild.id;
      document.getElementById(item).innerHTML = "<img id='" + originalItem + "' src='" + items[originalItem].src + "'>";
    }
  }

  var recipeFound = false;

  for (var i = 0; i < Object.keys(workbenchRecipes).length; i++) {
    if (recipeFound) break;
    for (var x = 0; x < workbenchRecipes[Object.keys(workbenchRecipes)[i]].length; x++) {
      if (document.querySelectorAll(".workbench .input .item")[x].innerHTML === "") {
        if (workbenchRecipes[Object.keys(workbenchRecipes)[i]][x] !== "") {
          document.querySelector(".workbench .output").innerHTML = "";
          break;
        }
      } else if (!document.querySelectorAll(".workbench .input .item")[x].firstChild) {
        document.querySelector(".workbench .output").innerHTML = "";
        break;
      } else if (document.querySelectorAll(".workbench .input .item")[x].firstChild.id !== workbenchRecipes[Object.keys(workbenchRecipes)[i]][x]) {
        document.querySelector(".workbench .output").innerHTML = "";
        break;
      }

      if (x === workbenchRecipes[Object.keys(workbenchRecipes)[i]].length - 1) {
        document.querySelector(".workbench .output").innerHTML = "<img id='" + Object.keys(workbenchRecipes)[i] + "' src='" + items[Object.keys(workbenchRecipes)[i]].src + "'>";
        recipeFound = true;
        break;
      }
    }
  }
}

function takeOutputFromWorkbench() {
  if (document.querySelector(".workbench .output").innerHTML === "") return;
  for (var i = 0; i < document.querySelectorAll(".workbench .input .item").length; i++) {
    document.querySelectorAll(".workbench .input .item")[i].innerHTML = "";
  }

  for (var x = 0; x < players[myId].inventory.length; x++) {
    if (players[myId].inventory[x] === "") {
      players[myId].inventory[x] = document.querySelector(".workbench .output").firstChild.id;
      break;
    }
    if (x === players[myId].inventory.length - 1) {
      for (var y = 0; y < players[myId].backpack.length; y++) {
        if (players[myId].backpack[y] === "") {
          players[myId].backpack[y] = document.querySelector(".workbench .output").firstChild.id;
          break;
        }
      }
    }
  }

  document.querySelector(".workbench .output").innerHTML = "";
  updateBackpack();
}

function useTool() {
  players[myId].useTool = true;
}

function cancelTool() {
  players[myId].useTool = false;
}

function getInBed(cords) {
  allowedToMove = false;
  players[myId].inBed = true;
  players[myId].x = cords.x + cords.w / 2 - framewidth / scale / 2 - 7;
  players[myId].y = cords.y + 45;
  players[myId].costumeY = 4;
  players[myId].currFrame = 0;

  setTimeout(() => {
    allowedToMove = true;
    players[myId].inBed = false;
    players[myId].x = cords.x - framewidth / scale;
    players[myId].y = cords.y;
    players[myId].costumeY = 0;
    players[myId].currFrame = 0;
    saveGame();
  }, 6000);
}