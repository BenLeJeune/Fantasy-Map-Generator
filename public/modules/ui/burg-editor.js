"use strict";
function editBurg(id) {
  if (customization) return;
  closeDialogs(".stable");
  if (!layerIsOn("toggleIcons")) toggleIcons();
  if (!layerIsOn("toggleLabels")) toggleLabels();

  const burg = id || d3.event.target.dataset.id;
  elSelected = burgLabels.select("[data-id='" + burg + "']");
  burgLabels.selectAll("text").call(d3.drag().on("start", dragBurgLabel)).classed("draggable", true);
  updateBurgValues();

  const my = id || d3.event.target.tagName === "text" ? "center bottom-20" : "center top+20";
  const at = id ? "center" : d3.event.target.tagName === "text" ? "top" : "bottom";
  const of = id ? "svg" : d3.event.target;

  $("#burgEditor").dialog({
    title: "Edit Burg", resizable: false, close: closeBurgEditor,
    position: {my, at, of, collision: "fit"}
  });

  if (modules.editBurg) return;
  modules.editBurg = true;

  // add listeners
  document.getElementById("burgGroupShow").addEventListener("click", showGroupSection);
  document.getElementById("burgGroupHide").addEventListener("click", hideGroupSection);
  document.getElementById("burgSelectGroup").addEventListener("change", changeGroup);
  document.getElementById("burgInputGroup").addEventListener("change", createNewGroup);
  document.getElementById("burgAddGroup").addEventListener("click", toggleNewGroupInput);
  document.getElementById("burgRemoveGroup").addEventListener("click", removeBurgsGroup);

  document.getElementById("burgName").addEventListener("input", changeName);
  document.getElementById("burgNameReRandom").addEventListener("click", generateNameRandom);
  document.getElementById("burgType").addEventListener("input", changeType);
  document.getElementById("burgCulture").addEventListener("input", changeCulture);
  document.getElementById("burgNameReCulture").addEventListener("click", generateNameCulture);
  document.getElementById("burgPopulation").addEventListener("change", changePopulation);
  burgBody.querySelectorAll(".burgFeature").forEach(el => el.addEventListener("click", toggleFeature));

  document.getElementById("burgStyleShow").addEventListener("click", showStyleSection);
  document.getElementById("burgStyleHide").addEventListener("click", hideStyleSection);
  document.getElementById("burgEditLabelStyle").addEventListener("click", editGroupLabelStyle);
  document.getElementById("burgEditIconStyle").addEventListener("click", editGroupIconStyle);
  document.getElementById("burgEditAnchorStyle").addEventListener("click", editGroupAnchorStyle);

  document.getElementById("burgSeeInMFCG").addEventListener("click", openInMFCG);
  document.getElementById("burgEditEmblem").addEventListener("click", openEmblemEdit);
  document.getElementById("burgRelocate").addEventListener("click", toggleRelocateBurg);
  document.getElementById("burglLegend").addEventListener("click", editBurgLegend);
  document.getElementById("burgRemove").addEventListener("click", removeSelectedBurg);

  function updateBurgValues() {
    const id = +elSelected.attr("data-id");
    const b = pack.burgs[id];
    const province = pack.cells.province[b.cell];
    const provinceName = province ? pack.provinces[province].fullName + ", " : "";
    const stateName = pack.states[b.state].fullName || pack.states[b.state].name;
    document.getElementById("burgProvinceAndState").innerHTML = provinceName + stateName;

    document.getElementById("burgName").value = b.name;
    document.getElementById("burgType").value = b.type || "Generic";
    document.getElementById("burgPopulation").value = rn(b.population * populationRate.value * urbanization.value);
    document.getElementById("burgEditAnchorStyle").style.display = +b.port ? "inline-block" : "none";

    // update list and select culture
    const cultureSelect = document.getElementById("burgCulture");
    cultureSelect.options.length = 0;
    const cultures = pack.cultures.filter(c => !c.removed);
    cultures.forEach(c => cultureSelect.options.add(new Option(c.name, c.i, false, c.i === b.culture)));

    const temperature = grid.cells.temp[pack.cells.g[b.cell]];
    document.getElementById("burgTemperature").innerHTML = convertTemperature(temperature);
    document.getElementById("burgTemperatureLikeIn").innerHTML = getTemperatureLikeness(temperature);
    document.getElementById("burgElevation").innerHTML = getHeight(pack.cells.h[b.cell]);

    // toggle features
    if (b.capital) document.getElementById("burgCapital").classList.remove("inactive");
    else document.getElementById("burgCapital").classList.add("inactive");
    if (b.port) document.getElementById("burgPort").classList.remove("inactive");
    else document.getElementById("burgPort").classList.add("inactive");
    if (b.citadel) document.getElementById("burgCitadel").classList.remove("inactive");
    else document.getElementById("burgCitadel").classList.add("inactive");
    if (b.walls) document.getElementById("burgWalls").classList.remove("inactive");
    else document.getElementById("burgWalls").classList.add("inactive");
    if (b.plaza) document.getElementById("burgPlaza").classList.remove("inactive");
    else document.getElementById("burgPlaza").classList.add("inactive");
    if (b.temple) document.getElementById("burgTemple").classList.remove("inactive");
    else document.getElementById("burgTemple").classList.add("inactive");
    if (b.shanty) document.getElementById("burgShanty").classList.remove("inactive");
    else document.getElementById("burgShanty").classList.add("inactive");

    // select group
    const group = elSelected.node().parentNode.id;
    const select = document.getElementById("burgSelectGroup");
    select.options.length = 0; // remove all options

    burgLabels.selectAll("g").each(function() {
      select.options.add(new Option(this.id, this.id, false, this.id === group));
    });

    // set emlem image
    const coaID = "burgCOA"+id;
    COArenderer.trigger(coaID, b.coa);
    document.getElementById("burgEmblem").setAttribute("href", "#" + coaID);
  }

  // in °C, array from -1 °C; source: https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature
  function getTemperatureLikeness(temperature) {
    if (temperature < -5) return "Yakutsk";
    const cities = [
      "Snag (Yukon)", "Yellowknife (Canada)", "Okhotsk (Russia)", "Fairbanks (Alaska)", "Nuuk (Greenland)", "Murmansk", // -5 - 0
      "Arkhangelsk", "Anchorage", "Tromsø", "Reykjavik", "Riga", "Stockholm", "Halifax", "Prague", "Copenhagen", "London", // 1 - 10
      "Antwerp", "Paris", "Milan", "Batumi", "Rome", "Dubrovnik", "Lisbon", "Barcelona", "Marrakesh", "Alexandria", // 11 - 20
      "Tegucigalpa", "Guangzhou", "Rio de Janeiro", "Dakar", "Miami", "Jakarta", "Mogadishu", "Bangkok", "Aden", "Khartoum"]; // 21 - 30
    if (temperature > 30) return "Mecca";
    return cities[temperature+5] || null;
  }

  function dragBurgLabel() {
    const tr = parseTransform(this.getAttribute("transform"));
    const dx = +tr[0] - d3.event.x, dy = +tr[1] - d3.event.y;

    d3.event.on("drag", function() {
      const x = d3.event.x, y = d3.event.y;
      this.setAttribute("transform", `translate(${(dx+x)},${(dy+y)})`);
      tip('Use dragging for fine-tuning only, to actually move burg use "Relocate" button', false, "warning");
    });
  }

  function showGroupSection() {
    document.querySelectorAll("#burgBottom > button").forEach(el => el.style.display = "none");
    document.getElementById("burgGroupSection").style.display = "inline-block";
  }

  function hideGroupSection() {
    document.querySelectorAll("#burgBottom > button").forEach(el => el.style.display = "inline-block");
    document.getElementById("burgGroupSection").style.display = "none";
    document.getElementById("burgInputGroup").style.display = "none";
    document.getElementById("burgInputGroup").value = "";
    document.getElementById("burgSelectGroup").style.display = "inline-block";
  }

  function changeGroup() {
    const id = +elSelected.attr("data-id");
    moveBurgToGroup(id, this.value);
  }

  function toggleNewGroupInput() {
    if (burgInputGroup.style.display === "none") {
      burgInputGroup.style.display = "inline-block";
      burgInputGroup.focus();
      burgSelectGroup.style.display = "none";
    } else {
      burgInputGroup.style.display = "none";
      burgSelectGroup.style.display = "inline-block";
    }
  }

  function createNewGroup() {
    if (!this.value) {tip("Please provide a valid group name", false, "error"); return;}
    const group = this.value.toLowerCase().replace(/ /g, "_").replace(/[^\w\s]/gi, "");

    if (document.getElementById(group)) {
      tip("Element with this id already exists. Please provide a unique name", false, "error");
      return;
    }

    if (Number.isFinite(+group.charAt(0))) {
      tip("Group name should start with a letter", false, "error");
      return;
    }

    const id = +elSelected.attr("data-id");
    const oldGroup = elSelected.node().parentNode.id;

    const label = document.querySelector("#burgLabels [data-id='" + id + "']");
    const icon = document.querySelector("#burgIcons [data-id='" + id + "']");
    const anchor = document.querySelector("#anchors [data-id='" + id + "']");
    if (!label || !icon) {ERROR && console.error("Cannot find label or icon elements"); return;}

    const labelG = document.querySelector("#burgLabels > #"+oldGroup);
    const iconG = document.querySelector("#burgIcons > #"+oldGroup);
    const anchorG = document.querySelector("#anchors > #"+oldGroup);

    // just rename if only 1 element left
    const count = elSelected.node().parentNode.childElementCount;
    if (oldGroup !== "cities" && oldGroup !== "towns" && count === 1) {
      document.getElementById("burgSelectGroup").selectedOptions[0].remove();
      document.getElementById("burgSelectGroup").options.add(new Option(group, group, false, true));
      toggleNewGroupInput();
      document.getElementById("burgInputGroup").value = "";
      labelG.id = group;
      iconG.id = group;
      if (anchor) anchorG.id = group;
      return;
    }

    // create new groups
    document.getElementById("burgSelectGroup").options.add(new Option(group, group, false, true));
    toggleNewGroupInput();
    document.getElementById("burgInputGroup").value = "";

    const newLabelG = document.querySelector("#burgLabels").appendChild(labelG.cloneNode(false));
    newLabelG.id = group;
    const newIconG = document.querySelector("#burgIcons").appendChild(iconG.cloneNode(false));
    newIconG.id = group;
    if (anchor) {
      const newAnchorG = document.querySelector("#anchors").appendChild(anchorG.cloneNode(false));
      newAnchorG.id = group;
    }
    moveBurgToGroup(id, group);
  }

  function removeBurgsGroup() {
    const group = elSelected.node().parentNode;
    const basic = group.id === "cities" || group.id === "towns";

    const burgsInGroup = [];
    for (let i=0; i < group.children.length; i++) {
      burgsInGroup.push(+group.children[i].dataset.id);
    }
    const burgsToRemove = burgsInGroup.filter(b => !pack.burgs[b].capital);
    const capital = burgsToRemove.length < burgsInGroup.length;

    alertMessage.innerHTML = `Are you sure you want to remove
      ${basic || capital ? "all elements in the group" : "the entire burg group"}?
      <br>Please note that capital burgs will not be deleted.
      <br><br>Burgs to be removed: ${burgsToRemove.length}`;
    $("#alert").dialog({resizable: false, title: "Remove route group",
      buttons: {
        Remove: function() {
          $(this).dialog("close");
          $("#burgEditor").dialog("close");
          hideGroupSection();
          burgsToRemove.forEach(b => removeBurg(b));

          if (!basic && !capital) {
            // entirely remove group
            const labelG = document.querySelector("#burgLabels > #"+group.id);
            const iconG = document.querySelector("#burgIcons > #"+group.id);
            const anchorG = document.querySelector("#anchors > #"+group.id);
            if (labelG) labelG.remove();
            if (iconG) iconG.remove();
            if (anchorG) anchorG.remove();
          }
        },
        Cancel: function() {$(this).dialog("close");}
      }
    });
  }

  function changeName() {
    const id = +elSelected.attr("data-id");
    pack.burgs[id].name = burgName.value;
    elSelected.text(burgName.value);
    //LISTENER
    window.changeDoc(doc => {
      let mapData = doc.getMap("mapData");
      let packMap = mapData.get("pack");
      let burgs = packMap.get("burgs");
      doc.transact(() => {
        burgs.delete( id, 1 );
        burgs.insert(id, [ pack.burgs[id] ]);
      });
    })
  }

  function generateNameRandom() {
    const base = rand(nameBases.length-1);
    burgName.value = Names.getBase(base);
    changeName();
  }

  function changeType() {
    const id = +elSelected.attr("data-id");
    pack.burgs[id].type = this.value
    //LISTENER
  }

  function changeCulture() {
    const id = +elSelected.attr("data-id");
    pack.burgs[id].culture = +this.value;
    //LISTENER
  }

  function generateNameCulture() {
    const id = +elSelected.attr("data-id");
    const culture = pack.burgs[id].culture;
    burgName.value = Names.getCulture(culture);
    changeName();
  }

  function changePopulation() {
    const id = +elSelected.attr("data-id");
    pack.burgs[id].population = rn(burgPopulation.value / populationRate.value / urbanization.value, 4);
    //LISTENER
  }

  function toggleFeature() {
    const id = +elSelected.attr("data-id");
    const b = pack.burgs[id];
    const feature = this.dataset.feature;
    const turnOn = this.classList.contains("inactive");
    if (feature === "port") togglePort(id);
    else if(feature === "capital") toggleCapital(id);
    else b[feature] = +turnOn;
    if (b[feature]) this.classList.remove("inactive");
    else if (!b[feature]) this.classList.add("inactive");

    if (b.port) document.getElementById("burgEditAnchorStyle").style.display = "inline-block";
    else document.getElementById("burgEditAnchorStyle").style.display = "none";
  }

  function showStyleSection() {
    document.querySelectorAll("#burgBottom > button").forEach(el => el.style.display = "none");
    document.getElementById("burgStyleSection").style.display = "inline-block";
  }

  function hideStyleSection() {
    document.querySelectorAll("#burgBottom > button").forEach(el => el.style.display = "inline-block");
    document.getElementById("burgStyleSection").style.display = "none";
  }

  function editGroupLabelStyle() {
    const g = elSelected.node().parentNode.id;
    editStyle("labels", g); //TODO: STYLE LISTENERS
  }

  function editGroupIconStyle() {
    const g = elSelected.node().parentNode.id;
    editStyle("burgIcons", g);
  }

  function editGroupAnchorStyle() {
    const g = elSelected.node().parentNode.id;
    editStyle("anchors", g);
  }

  function openInMFCG(event) {
    const id = elSelected.attr("data-id");
    const burg = pack.burgs[id];
    const defSeed = +(seed + id.padStart(4, 0));
    if (isCtrlClick(event)) {
      prompt(`Please provide a Medieval Fantasy City Generator seed. 
        Seed should be a number. Default seed is FMG map seed + burg id padded to 4 chars with zeros (${defSeed}). 
        Please note that if seed is custom, "Overworld" button from MFCG will open a different map`,
        {default:burg.MFCG||defSeed, step:1, min:1, max:1e13-1}, v => {
        burg.MFCG = v;
        openMFCG(v);
      });
    } else openMFCG();

    function openMFCG(seed) {
      if (!seed && burg.MFCGlink) {openURL(burg.MFCGlink); return;}
      const cells = pack.cells;
      const name = elSelected.text();
      const size = Math.max(Math.min(rn(burg.population), 100), 6); // to be removed once change on MFDC is done
      const population = rn(burg.population * populationRate.value * urbanization.value);
  
      const s = burg.MFCG || defSeed;
      const cell = burg.cell;
      const hub = +cells.road[cell] > 50;
      const river = cells.r[cell] ? 1 : 0;
  
      const coast = +burg.port;
      const citadel = +burg.citadel;
      const walls = +burg.walls;
      const plaza = +burg.plaza;
      const temple = +burg.temple;
      const shanty = +burg.shanty;

      const sea = coast && cells.haven[burg.cell] ? getSeaDirections(burg.cell) : "";
      function getSeaDirections(i) {
        const p1 = cells.p[i];
        const p2 = cells.p[cells.haven[i]];
        let deg = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180 / Math.PI - 90;
        if (deg < 0) deg += 360;
        const norm = rn(normalize(deg, 0, 360) * 2, 2); // 0 = south, 0.5 = west, 1 = north, 1.5 = east
        return "&sea="+norm;
      }

      const site = "http://fantasycities.watabou.ru/?random=0&continuous=0";
      const url = `${site}&name=${name}&population=${population}&size=${size}&seed=${s}&hub=${hub}&river=${river}&coast=${coast}&citadel=${citadel}&plaza=${plaza}&temple=${temple}&walls=${walls}&shantytown=${shanty}${sea}`;
      openURL(url);
    }
  }

  function openEmblemEdit() {
    const id = +elSelected.attr("data-id"), burg = pack.burgs[id];
    editEmblem("burg", "burgCOA"+id, burg);
  }

  function toggleRelocateBurg() {
    const toggler = document.getElementById("toggleCells");
    document.getElementById("burgRelocate").classList.toggle("pressed");
    if (document.getElementById("burgRelocate").classList.contains("pressed")) {
      viewbox.style("cursor", "crosshair").on("click", relocateBurgOnClick);
      tip("Click on map to relocate burg. Hold Shift for continuous move", true);
      if (!layerIsOn("toggleCells")) {toggleCells(); toggler.dataset.forced = true;}
    } else {
      clearMainTip();
      viewbox.on("click", clicked).style("cursor", "default");
      if (layerIsOn("toggleCells") && toggler.dataset.forced) {toggleCells(); toggler.dataset.forced = false;}
    }
  }

  function relocateBurgOnClick() {
    const cells = pack.cells;
    const point = d3.mouse(this);
    const cell = findCell(point[0], point[1]);
    const id = +elSelected.attr("data-id");
    const burg = pack.burgs[id];

    if (cells.h[cell] < 20) {
      tip("Cannot place burg into the water! Select a land cell", false, "error");
      return;
    }

    if (cells.burg[cell] && cells.burg[cell] !== id) {
      tip("There is already a burg in this cell. Please select a free cell", false, "error");
      return;
    }

    const newState = cells.state[cell];
    const oldState = burg.state;

    if (newState !== oldState && burg.capital) {
      tip("Capital cannot be relocated into another state!", false, "error");
      return;
    }

    // change UI
    const x = rn(point[0], 2), y = rn(point[1], 2);
    burgIcons.select("[data-id='" + id + "']").attr("transform", null).attr("cx", x).attr("cy", y);
    burgLabels.select("text[data-id='" + id + "']").attr("transform", null).attr("x", x).attr("y", y);
    const anchor = anchors.select("use[data-id='" + id+ "']");
    if (anchor.size()) {
      const size = anchor.attr("width");
      const xa = rn(x - size * 0.47, 2);
      const ya = rn(y - size * 0.47, 2);
      anchor.attr("transform", null).attr("x", xa).attr("y", ya);
    }

    // change data
    cells.burg[burg.cell] = 0;
    cells.burg[cell] = id;
    burg.cell = cell;
    burg.state = newState;
    burg.x = x;
    burg.y = y;
    if (burg.capital) pack.states[newState].center = burg.cell;
    //LISTENER

    if (d3.event.shiftKey === false) toggleRelocateBurg();
  }

  function editBurgLegend() {
    const id = elSelected.attr("data-id");
    const name = elSelected.text();
    editNotes("burg"+id, name);
    //LISTENER
  }

  function removeSelectedBurg() {
    const id = +elSelected.attr("data-id");
    if (pack.burgs[id].capital) {
      alertMessage.innerHTML = `You cannot remove the burg as it is a state capital.<br><br>
        You can change the capital using Burgs Editor (shift + T)`;
      $("#alert").dialog({resizable: false, title: "Remove burg",
        buttons: {Ok: function() {$(this).dialog("close");}}
      });
    } else {
      alertMessage.innerHTML = "Are you sure you want to remove the burg?";
      $("#alert").dialog({resizable: false, title: "Remove burg",
        buttons: {
          Remove: function() {
            $(this).dialog("close");
            removeBurg(id); // see Editors module
            $("#burgEditor").dialog("close");
          },
          Cancel: function() {$(this).dialog("close");}
        }
      });
    }
    //LISTENER
  }

  function closeBurgEditor() {
    document.getElementById("burgRelocate").classList.remove("pressed");
    burgLabels.selectAll("text").call(d3.drag().on("drag", null)).classed("draggable", false);
    unselect();
  }

}
