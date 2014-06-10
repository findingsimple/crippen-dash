function MapUI(options) {
    var context = this, colours = {}, legend = {}, tooltip, tooltipText, timer;

    colours.normal = '#888888';
    colours.hover = '#666666';
    colours.taken = '#cccccc';
    colours.selected = '#66cc33';
    colours.associated = '#aaaaaa';
    colours.pending = '#ffcc33';
    colours.disabled = '#66c6f9';
    colours.disabledHover = '#3393c6';
    colours.onHold = '#43A2CA';

    legend.normal = 'Available';
    legend.taken = 'Unavailable';
    legend.selected = 'Selected';

    // so we can access colours "outside" the MapUI object
    context.colours = colours;
    context.legend = legend;

    context.backButton = null;
    context.backButtonCallback = null;

    context.mouseOverHandler = null;
    context.mouseOutHandler = null;

    function defined(object) {
        return typeof object !== 'undefined' && object !== null;
    }

    function merge(first, second) {
        var key;

        if (!first) {
            first = {};
        }

        for (key in second) {
            first[key] = second[key];
        }

        return first;
    }

    function initOptions(options) {
        if (defined(options.colours) && typeof options.colours === 'object') {
            context.colours = colours = merge(colours, options.colours);
        }

        if (defined(options.legend)) {
            if (typeof options.legend === 'object') {
                legend = merge(legend, options.legend);
            } else {
                legend = options.legend;
            }

            context.legend = legend;
        }
    }

    if (defined(options)) {
        initOptions(options);
    }

    context.getSVG = function () {
        return document.getElementById('map');
    }

    context.getSections = function () {
        return context.getSVG().getElementsByTagNameNS(svgns, 'g');
    };

    context.getSectionNames = function () {
        var sections = context.getSections(), names = [], match;

        for (var i = 0; match = sections[i]; ++i) {
            var name = match.getAttribute('id');

            names.push(name);
        }

        return names;
    };

    context.getSeats = function () {
        return context.getSVG().getElementsByTagNameNS(svgns, 'circle');
    };

    context.getSeatsBySection = function (section) {
        var group = document.getElementById(section);

        return group.getElementsByTagNameNS(svgns, 'circle');
    };

    context.setSeatHover = function (callback) {
        var seats = context.getSeats(), match;
        for (var i = 0; match = seats[i]; ++i) {

            context.mouseOverHandler = function (e) {
                elementMouseOver(e.target);
            }

            context.mouseOutHandler = function (e) {
                elementMouseOut(e.target);
            }

            match.addEventListener('mouseover', context.mouseOverHandler, false);

            match.addEventListener('mouseout', context.mouseOutHandler, false);
        }

        if (typeof callback != 'undefined') {
           callback();
        }
    };

    context.setSeatTooltip = function (tooltip) {
        context.createTooltip();

        var seats = context.getSeats(), match;
        for (var i = 0; match = seats[i]; ++i) {

            match.addEventListener('mouseover', function () {
                var rowName = this.getAttribute('id').split('_'), x = this.getAttribute('cx'), y = this.getAttribute('cy'), ticketType = this.getAttribute('ticket-type'), ticketPrice = this.getAttribute('ticket-price'), tooltipText = 'Seat ' + rowName[0] + rowName[1];

                if (ticketType && ticketPrice) {
                    tooltipText += ', '+ticketType+' '+ticketPrice;
                }

                timer = setTimeout(function () {
                    context.changeTooltipText(tooltipText);
                    context.moveTooltip(x, y);
                    context.showTooltip();
                }, 500);
            }, false);

            match.addEventListener('mouseout', function () {
                context.hideTooltip();

                clearTimeout(timer);
            }, false);
        }
    };

    context.createBackButton = function() {
        var button = document.createElementNS(svgns, 'path');
        button.setAttribute('d', 'm15 22.5c0 5.524 4.477 10 10 10 5.522 0 10-4.476 10-10 0-5.523-4.478-10-10-10-5.523 0-10 4.477-10 10zm2.855-0.432l6.359-4.28v2.575s7.333 0.562 7.333 5.986c0 0-0.927-2.226-4.475-2.648-0.581-0.069-1.463-0.137-2.86-0.137v2.784l-6.357-4.28z');
        button.setAttribute('id', 'back-button');
        button.setAttribute('fill', '#888888');

        context.backButton = button;

        var buttonText = document.createElementNS(svgns, 'text');
        buttonText.setAttribute('font-family', 'Helvetica, Arial, sans-serif');
        buttonText.setAttribute('font-size', 14);
        buttonText.setAttribute('fill', '#666666');
        buttonText.setAttribute('transform', 'translate(40 27)');

        var text = document.createTextNode('Back to Map', true);
        buttonText.appendChild(text);

        var map = context.getSVG();

        map.appendChild(button);
        map.appendChild(buttonText);

        button.addEventListener('mouseover', function () {
            elementMouseOver(this, 'button');
        }, false);

        button.addEventListener('mouseout', function () {
            elementMouseOut(this, 'button');
        }, false);

        button.addEventListener('click', function () {
            if (context.backButtonCallback !== null) {
                context.backButtonCallback();
            } else {
                window.location.reload(true);
            }
        }, false);
    }

    context.createTooltip = function () {
        var map = context.getSVG(), value;

        tooltip = document.createElementNS(svgns, 'rect');
        tooltip.setAttribute('visibility', 'hidden');
        tooltip.setAttribute('fill', '#333333');
        tooltip.setAttribute('fill-opacity', 0.75);
        tooltip.setAttribute('width', 100);
        tooltip.setAttribute('height', 20);
        tooltip.setAttribute('rx', 5);
        tooltip.setAttribute('ry', 5);

        map.appendChild(tooltip);

        tooltipText = document.createElementNS(svgns, 'text');
        tooltipText.setAttribute('visibility', 'hidden');
        tooltipText.setAttribute('font-family', 'Arial, sans-serif');
        tooltipText.setAttribute('font-size', 12);
        tooltipText.setAttribute('fill', '#ffffff');
        tooltipText.setAttribute('x', 5);
        tooltipText.setAttribute('y', 15);

        map.appendChild(tooltipText);

        value = document.createTextNode('Tooltip', true);
        tooltipText.appendChild(value);
    };

    context.changeTooltipText = function(value) {
        tooltipText.firstChild.data = value;
        tooltip.setAttribute('width', (tooltipText.getComputedTextLength ? tooltipText.getComputedTextLength() : tooltipText.getBBox().width) + 10);
    };

    context.showTooltip = function() {
        tooltip.setAttribute('visibility', 'block');
        tooltipText.setAttribute('visibility', 'block');
    };

    context.hideTooltip = function() {
        tooltip.setAttribute('visibility', 'hidden');
        tooltipText.setAttribute('visibility', 'hidden');
    };

    context.moveTooltip = function(x, y) {
        x = pInt(x) || 0;
        y = pInt(y) || 0;

        var mapWidth = pInt(context.getSVG().getAttribute('width')),
            tooltipWidth = pInt(tooltip.getAttribute('width'));

        //console.log('mapWidth: '+mapWidth);
        //console.log('tooltipWidth: '+tooltipWidth);
        //console.log('tooltipWidthX: ' +(tooltipWidth + x));

        if ((x + tooltipWidth) > mapWidth) {
            x = mapWidth - (tooltipWidth + 10);
        }

        tooltip.setAttribute('x', x + 5);
        tooltip.setAttribute('y', y - 30);
        tooltipText.setAttribute('x', x + 10);
        tooltipText.setAttribute('y', y - 15);
    };

    context.removeMap = function() {
        var map = context.getSVG();

        svgweb.removeChild(map, map.parentNode);
    }

    context.createMap = function(data, parentNode, callback) {
        var map = document.createElementNS(svgns, data.name), attribute;

        if (data.attributes) {
            for (attribute in data.attributes) {
                if (data.attributes.hasOwnProperty(attribute)) {
                    map.setAttribute(attribute, data.attributes[attribute]);
                }
            }
        }

        if (legend) {
            context.createLegend(map);
        }

        if (data.children) {
            context.createMapFragment(map, data.children);
        }

        if (typeof callback != 'undefined') {
            map.addEventListener('SVGLoad', callback, false);
        }

        svgweb.appendChild(map, parentNode || document.body);
    }

    context.createMapFragment = function(map, data) {
        var fragment = document.createDocumentFragment(true), i, match, element, value;

        for (i = 0; match = data[i]; ++i) {
            var element = document.createElementNS(svgns, match.name);

            if (match.value) {
                value = document.createTextNode(match.value, true);
                element.appendChild(value);
            }

            if (match.attributes) {
                for (var attribute in match.attributes) {
                    if (match.attributes.hasOwnProperty(attribute)) {
                        element.setAttribute(attribute, match.attributes[attribute]);
                    }
                }
            }

            if (match.children) {
                context.createMapFragment(element, match.children);
            }

            fragment.appendChild(element);
        }

        map.appendChild(fragment);
    }

    context.setSectionHover = function() {
        var sections = context.getSections(), match;

        for (var i = 0; match = sections[i]; ++i) {
            var section = match.firstChild;

            section.addEventListener('mouseover', function () {
                elementMouseOver(this, 'section');
            }, false);

            section.addEventListener('mouseout', function () {
                elementMouseOut(this, 'section');
            }, false);
        }
    };

    function elementMouseOver(element, type) {
        if (element.getAttribute('fill') === colours.normal) {
            element.setAttribute('fill', colours.hover);
        }
    }

    function elementMouseOut(element, type) {
        if (element.getAttribute('fill') === colours.hover) {
            element.setAttribute('fill', colours.normal);
        }
    }

    context.setSeatColour = function(seats, colour) {

    }

    context.createLegend = function(map) {
        var fragment = document.createDocumentFragment(true), key, rect, text, value, x = 600, y = 0;

        for (key in legend) {
            if (legend.hasOwnProperty(key)) {
                rect = document.createElementNS(svgns, 'rect');
                rect.setAttribute('width', 10);
                rect.setAttribute('height', 10);
                rect.setAttribute('stroke', '#cccccc');
                rect.setAttribute('fill', colours[key]);
                rect.setAttribute('x', x);
                rect.setAttribute('y', y);

                fragment.appendChild(rect);

                text = document.createElementNS(svgns, 'text');
                text.setAttribute('fill', '#666666');
                text.setAttribute('font-family', 'Arial, sans-serif');
                text.setAttribute('font-size', 12);
                text.setAttribute('x', x + 15);
                text.setAttribute('y', y + 10);
                text.appendChild(document.createTextNode(legend[key], true));

                fragment.appendChild(text);

                //x += 10;
                y += 15;
            }
        }

        map.appendChild(fragment);
    }
}
