(function () {
  "use strict";

  var root = document.querySelector("[data-travel-map]");
  var dataNode = document.getElementById("travel-map-data");
  if (!root || !dataNode) return;

  var places;
  try {
    places = JSON.parse(dataNode.textContent);
  } catch (error) {
    return;
  }

  var placeList = root.querySelector(".travel-place-list");
  places.forEach(function (place, index) {
    var button = document.createElement("button");
    var dot = document.createElement("span");
    var copy = document.createElement("span");
    var name = document.createElement("strong");
    var detail = document.createElement("small");

    button.type = "button";
    button.className = "travel-place" + (index === 0 ? " is-active" : "");
    button.setAttribute("data-place", place.id);
    dot.className = "travel-place-dot";
    dot.setAttribute("aria-hidden", "true");
    name.textContent = place.name;
    detail.textContent = place.detail;
    copy.appendChild(name);
    copy.appendChild(detail);
    button.appendChild(dot);
    button.appendChild(copy);
    placeList.appendChild(button);
  });

  var svgNode = root.querySelector(".travel-globe");
  var wrap = root.querySelector(".travel-globe-wrap");
  var tooltip = root.querySelector(".travel-tooltip");
  var loading = root.querySelector(".travel-loading");
  var buttons = Array.prototype.slice.call(root.querySelectorAll(".travel-place"));
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var activePlace = places[0];
  var rotation = [-112, -32, 0];
  var dragging = false;
  var interacting = false;
  var lastFrame = 0;
  var resizeTimer;

  function showError() {
    loading.textContent = "The interactive map could not be loaded.";
    loading.classList.add("is-error");
  }

  function waitForLibraries(attempts) {
    if (window.d3 && window.topojson) {
      initialise();
      return;
    }
    if (attempts > 80) {
      showError();
      return;
    }
    window.setTimeout(function () {
      waitForLibraries(attempts + 1);
    }, 50);
  }

  function initialise() {
    var d3 = window.d3;
    var topojson = window.topojson;
    var svg = d3.select(svgNode);
    var projection = d3.geoOrthographic().clipAngle(90).precision(0.4);
    var path = d3.geoPath(projection);
    var sphere = { type: "Sphere" };
    var graticule = d3.geoGraticule10();
    var countries;
    var countryPaths;
    var markerLayer;
    var animationFrame;

    var ocean = svg.append("path").attr("class", "travel-ocean");
    var grid = svg.append("path").attr("class", "travel-graticule");
    var landLayer = svg.append("g").attr("class", "travel-land");
    markerLayer = svg.append("g").attr("class", "travel-markers");
    var rim = svg.append("path").attr("class", "travel-rim");

    function sizeGlobe() {
      var width = Math.max(280, wrap.clientWidth);
      var height = Math.max(300, Math.min(470, width * 0.62));
      var radius = Math.min(width * 0.43, height * 0.46);
      svg.attr("viewBox", "0 0 " + width + " " + height);
      projection.translate([width / 2, height / 2]).scale(radius).rotate(rotation);
      draw();
    }

    function isVisible(coordinates) {
      var centre = [-projection.rotate()[0], -projection.rotate()[1]];
      return d3.geoDistance(coordinates, centre) < Math.PI / 2;
    }

    function drawMarkers() {
      var markers = markerLayer.selectAll(".travel-marker").data(places, function (d) { return d.id; });
      var enter = markers.enter().append("g")
        .attr("class", function (d) { return "travel-marker travel-marker--" + d.status; })
        .attr("tabindex", "0")
        .attr("role", "button")
        .attr("aria-label", function (d) { return d.name + ": " + d.detail; })
        .on("mouseenter focus", function (event, d) {
          interacting = true;
          setActive(d, event);
        })
        .on("mouseleave blur", function () {
          interacting = false;
          hideTooltip();
        })
        .on("click", function (event, d) {
          focusPlace(d, true);
        });

      enter.append("circle").attr("class", "travel-marker-pulse").attr("r", 9);
      enter.append("circle").attr("class", "travel-marker-core").attr("r", 3.7);

      markers = enter.merge(markers);
      markers
        .attr("transform", function (d) {
          var point = projection(d.coordinates);
          return "translate(" + point[0] + "," + point[1] + ")";
        })
        .attr("opacity", function (d) { return isVisible(d.coordinates) ? 1 : 0; })
        .attr("pointer-events", function (d) { return isVisible(d.coordinates) ? "auto" : "none"; })
        .classed("is-active", function (d) { return activePlace && d.id === activePlace.id; });
    }

    function draw() {
      projection.rotate(rotation);
      ocean.attr("d", path(sphere));
      grid.attr("d", path(graticule));
      rim.attr("d", path(sphere));
      if (countryPaths) countryPaths.attr("d", path);
      drawMarkers();
    }

    function tooltipPosition(place) {
      var point = projection(place.coordinates);
      var wrapRect = wrap.getBoundingClientRect();
      var x = point[0];
      var y = point[1] - 17;
      tooltip.style.left = Math.max(88, Math.min(wrapRect.width - 88, x)) + "px";
      tooltip.style.top = Math.max(44, y) + "px";
    }

    function setActive(place) {
      activePlace = place;
      buttons.forEach(function (button) {
        button.classList.toggle("is-active", button.getAttribute("data-place") === place.id);
      });
      tooltip.innerHTML = "<strong>" + place.name + "</strong><span>" + place.detail + "</span>";
      tooltip.hidden = false;
      tooltipPosition(place);
      drawMarkers();
    }

    function hideTooltip() {
      tooltip.hidden = true;
    }

    function focusPlace(place, keepTooltip) {
      activePlace = place;
      rotation = [-place.coordinates[0], -place.coordinates[1], 0];
      draw();
      setActive(place);
      if (!keepTooltip) hideTooltip();
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var id = button.getAttribute("data-place");
        var place = places.filter(function (item) { return item.id === id; })[0];
        if (place) focusPlace(place, true);
      });
      button.addEventListener("mouseenter", function () { interacting = true; });
      button.addEventListener("mouseleave", function () { interacting = false; });
    });

    svg.call(
      d3.drag()
        .on("start", function () {
          dragging = true;
          interacting = true;
          svg.classed("is-dragging", true);
          hideTooltip();
        })
        .on("drag", function (event) {
          var sensitivity = 75 / projection.scale();
          rotation[0] += event.dx * sensitivity;
          rotation[1] = Math.max(-75, Math.min(75, rotation[1] - event.dy * sensitivity));
          draw();
        })
        .on("end", function () {
          dragging = false;
          interacting = false;
          svg.classed("is-dragging", false);
        })
    );

    function animate(time) {
      if (!lastFrame) lastFrame = time;
      var delta = Math.min(40, time - lastFrame);
      lastFrame = time;
      if (!reducedMotion && !dragging && !interacting) {
        rotation[0] += delta * 0.0022;
        draw();
      }
      animationFrame = window.requestAnimationFrame(animate);
    }

    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json")
      .then(function (response) {
        if (!response.ok) throw new Error("Map data unavailable");
        return response.json();
      })
      .then(function (world) {
        countries = topojson.feature(world, world.objects.countries).features;
        countryPaths = landLayer.selectAll("path")
          .data(countries)
          .enter()
          .append("path")
          .attr("class", function (country) {
            return String(country.id) === "156" ? "travel-country is-visited" : "travel-country";
          });
        loading.hidden = true;
        root.classList.add("is-ready");
        sizeGlobe();
        animationFrame = window.requestAnimationFrame(animate);
      })
      .catch(showError);

    sizeGlobe();
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(sizeGlobe, 100);
    });

    window.addEventListener("pagehide", function () {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    }, { once: true });
  }

  waitForLibraries(0);
}());
