function MapEvent(mapUI, mapId, canvas, ticketType)
{
    var context = this;

    context.mapUI = mapUI;
    context.mapId = mapId;
    context.canvas = canvas;
    context.ticketType = ticketType;
    context.selectedSeats = {};
    context.ticketTypeSeats = 0;
    context.numSeats = 0;
    context.loaded = false;
    context.hasSections = false;
    context.seatPackTotal = null;

    if (typeof context.mapId !== 'undefined') {
        $.ajax({
            url: '/event/ajax_map/' + context.mapId ,
            dataType: 'json',
            success: function (data) {
                if (data.success === true) {
                    if (data.sections !== false) {
                        context.hasSections = true;
                        context.initSections(data);
                    } else {
                        context.initSeats(data);
                    }

                    context.loaded = true;
                }
            }
        });
    }

    context.initSections = function (data)
    {
        "use strict";
        context.mapUI.createMap(data.map, canvas, function () {
            context.mapUI.setSectionHover();

            var sections = context.mapUI.getSections(), match;

            for (var i = 0; match = sections[i]; ++i) {
                match.firstChild.setAttribute('id', data.sections[match.getAttribute('id').replace('_', ' ')]);
                match.firstChild.setAttribute('fill', context.mapUI.colours.taken);
                match.firstChild.addEventListener('click', context.clickGroup, false);
            }

            context.setAvailableSections();
        });

    }

    context.initSeats = function (data)
    {
        "use strict";
        context.mapUI.createMap(data.map, canvas, function () {
            var circles = context.mapUI.getSeats(), match;

            for (var i = 0; match = circles[i]; ++i) {
                match.addEventListener('click', context.clickSeat, false);
                match.setAttribute('fill', context.mapUI.colours.taken);
            }

            if (context.hasSections) {
                context.mapUI.createBackButton();
                context.hasSections = false;
            }

            context.setAvailableSeats();
            context.mapUI.setSeatHover();
            context.mapUI.setSeatTooltip();
        });
    }

    context.clickGroup = function ()
    {
        "use strict";
        var section = this;
        context.mapId = section.getAttribute('id');

        $.ajax({
            url: '/event/ajax_map/' + context.mapId,
            dataType: 'json',
            success: function (data) {
                if (data.success === true) {
                    if (data.sections != false) {
                        context.initSections(data);
                    } else {
                        context.mapUI.removeMap();
                        context.initSeats(data);
                    }
                }
            }
        });

    }

    context.clickSeat = function ()
    {
        var seat = this,
            seat_fill = seat.getAttribute('fill'),
            seat_id = seat.getAttribute('id');

        if (seat_fill != context.mapUI.colours.taken && seat_fill != context.mapUI.colours.selected) {
            $.ajax({
                url: '/cart/ajax_add_ticket',
                dataType: 'json',
                data: {
                    map_id: context.mapId,
                    seat: seat_id,
                    type_id: context.ticketType
                },
                type: 'POST',
                success: function (data) {
                    if (data.success === true) {
                        context.selectedSeats[seat_id] = data.cart_item_id;
                        context.numSeats++;
                        context.ticketTypeSeats++;
                        $('#cart-items').load('/cart #cart_items', function () {
                            init_left_col_cart();
                            if (context.numSeats == 1) {
                                $(this).hide();
                                $(this).fadeIn(200);
                            }

                            if(typeof context.seatAddCallback == 'function') {
                                context.seatAddCallback(null, seat_id);
                            }
                        });

                        seat.setAttribute('fill', context.mapUI.colours.selected);
                    } else {
                        if(typeof context.seatAddCallback == 'function') {
                            context.seatAddCallback(data.errors, seat_id);
                        } else {
                            alert(data.errors);
                        }

                        if (data.errors.toString().substring(0, 24) !== 'You can add a maximum of') {
                            seat.setAttribute('fill', context.mapUI.colours.normal);
                        }
                    }
                }
            });
        } else if (seat_fill == context.mapUI.colours.selected) {
            $.ajax({
                url: '/cart/ajax_remove_ticket',
                dataType: 'json',
                data: 'cart_item_id=' + context.selectedSeats[seat_id],
                type: 'POST',
                async: false,
                success: function (data) {
                    if (data.success === true) {
                        delete context.selectedSeats[seat_id];
                        context.numSeats--;
                        context.ticketTypeSeats--;

                        $('#cart-items').load('/cart #cart_items', function () {
                            init_left_col_cart();
                            
                            if(typeof context.seatRemoveCallback == 'function') {
                                context.seatRemoveCallback(null, seat_id);
                            }
                        });

                        seat.setAttribute('fill', context.mapUI.colours.normal);
                    } else {
                        if(typeof context.seatRemoveCallback == 'function') {
                            context.seatRemoveCallback(data.errors, seat_id);
                        } else {
                            alert(data.errors);
                        }
                    }
                }
            });
        }
    }

    context.setAvailableSeats = function (ticketType) {
        if (typeof ticketType === 'undefined') {
            ticketType = context.ticketType;
        } else {
            context.ticketType = ticketType;
        }

        $.ajax({
            url: '/event/ajax_available_seats/' + context.mapId + '/' + ticketType,
            dataType: 'json',
            cache: false,
            success: function (data) {
                var map, seats = context.mapUI.getSeats(), seat, seat_id;
                if (data.success === true) {
                    map = data.map
                    for (var i = 0; seat = seats[i]; ++i) {
                        if (seat.getAttribute('fill') != context.mapUI.colours.selected) {
                            seat.setAttribute('fill', context.mapUI.colours.taken);
                        }
                    }

                    for (var j = 0; seat = map[j]; ++j) {
                        seat_id = seat.seat_row + '_' + seat.seat_name;
                        seat = document.getElementById(seat_id);
                        seat.setAttribute('fill', context.mapUI.colours.normal);
                        //seat.setAttribute('ticket-type', match.ticket_type_name);
                        //seat.setAttribute('ticket-price', match.ticket_type_price);
                    }

                    if (data.num_seats) {
                        context.seatPackTotal = data.num_seats;
                        //alert('Please select ' + context.seatPackTotal + ' seats');
                    } else {
                        context.seatPackTotal = null;
                    }
                } else {
                    for (var z = 0; seat = seats[z]; ++z) {
                        if (seat.id) {
                            if (seat.getAttribute('fill') != context.mapUI.colours.selected) {
                                seat.setAttribute('fill', context.mapUI.colours.taken);
                            }
                        }
                    }
                }

                context.ticketTypeSeats = 0;

                context.setCartSeats();
            }
        });
    }

    context.setCartSeats = function () {
        $.ajax({
            url: '/event/ajax_cart_seats/' + context.mapId,
            dataType: 'json',
            success: function (data) {
                if (data.success === true) {
                    var map = data.map, seat, seat_id, match;

                    for (var i = 0; match = map[i]; ++i) {
                        seat_id = match.seat_row + '_' + match.seat_name;
                        seat = document.getElementById(seat_id);

                        if (match.user != null) {
                            seat.setAttribute('fill', context.mapUI.colours.selected);
                            context.selectedSeats[seat_id] = match.cart_item_id;
                            context.numSeats++;

                            if (match.type_id == context.ticketType) {
                                context.ticketTypeSeats++;
                            }
                        }

                        if (context.numSeats > 0) {
                            $('#cart-items').load('/cart #cart_items', function () {
                                init_left_col_cart();
                            });
                        }
                    }
                }
            }
        });
    }

    context.getSelectedSeats = function () {
        return context.selectedSeats;
    }

    context.setAvailableSections = function (ticketType) {
        if (typeof ticketType === 'undefined') {
            ticketType = context.ticketType;
        } else {
            context.ticketType = ticketType;
        }

        $.ajax({
            url: '/event/ajax_available_sections/' + context.mapId + '/' + ticketType,
            dataType: 'json',
            success: function (data) {
                var map, sections = context.mapUI.getSections(), section, section_id;
                if (data.success === true) {
                    map = data.map;

                    for (var i = 0; section = sections[i]; ++i) {
                        section.firstChild.setAttribute('fill', context.mapUI.colours.taken);
                    }

                    for (var j = 0; match = map[j]; ++j) {
                        section_id = match.name.replace(' ', '_');
                        section = document.getElementById(section_id);
                        section.firstChild.setAttribute('fill', context.mapUI.colours.normal);
                    }
                } else {
                    for (var z = 0; section = sections[z]; ++z) {
                        if (section.id) {
                            section.firstChild.setAttribute('fill', context.mapUI.colours.taken);
                        }
                    }
                }
            }
        });
    }

    context.getMapId = function () {
        return context.mapId;
    }
}