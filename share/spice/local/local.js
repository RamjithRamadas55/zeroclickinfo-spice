var ddg_spice_local_map;
var ddg_spice_local_markers = [];
var ddg_spice_local_current = 0;

function ddg_spice_local(api_response) {
    if (!api_response || api_response.length == 0) return;

    for (var i in api_response.businesses)
        api_response.businesses[i].index = i;

    Spice.render({
        //header1                  : ' (Local)',
        source_url               : 'http://yelp.com/?q='
                                    + encodeURIComponent(DDG.get_query()),
        source_name              : 'places near you',
        template_frame           : 'carousel',
        template_normal          : 'local',
        template_options         : { li_width : 400 },
        carousel_css_id          : 'local',
        carousel_template_detail : 'local_detail',
        carousel_items           : api_response.businesses,
        force_no_fold            : true,
        data                     : api_response,
    });

    $('#ddgc_detail').append($('<div>').attr('id', 'map'));
    $.getScript("/dist/leaflet.js", function() { render_map(api_response) });

    $('#local .ddgc_item').off().click(function(e) { $('#ddgc_detail').show() });

    var dots = $('#ddgc_dots a').off();
    for (var i in dots) dots[i].id = i;
    dots.click(function(e) {
        var page = ddg_spice_local_current = e.target.id;
        for (var i in ddg_spice_local_markers) {
            if (i == e.target.id) {
                ddg_spice_local_markers[i]
                    ._icon.src = '/dist/images/marker-icon-green.png';
            } else {
                ddg_spice_local_markers[i]
                    ._icon.src = '/dist/images/marker-icon.png';
            }
        }
        ddg_spice_local_map.setView(
            ddg_spice_local_markers[page].getLatLng(), 13,
                { 'animate' : true });
        $('#ddgc_slides').css('margin-left',
            -1 * $('#ddgc_frame').outerWidth() * page);
        dots.attr('class', '');
        $(e.target).attr('class', 'ddgc_selected');
    });

    $('#ddgc_pagination').off().click(function(e) {
        if (e.target.id == 'nexta' && ddg_spice_local_current != dots.length - 1)
            dots[++ddg_spice_local_current].click();
        else if (e.target.id == 'preva' && ddg_spice_local_current != 0)
            dots[--ddg_spice_local_current].click();
    });

};

function render_map(api_response) {
    L.Icon.Default.imagePath = "/dist/images";
    ddg_spice_local_map = L.map('map');

    var attribution = 'Map data &copy; '
        + '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors, '
        + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,'
        + 'Imagery &copy <a href="http://cloudmade.com">CloudMade</a>';

    L.tileLayer(
        'http://{s}.tile.cloudmade.com/2f62ad0b4ba046f2b907b67e2c866fa4'
            + '/997/256/{z}/{x}/{y}.png',
        { 'attribution' : attribution, 'maxZoom' : 18 }
    ).addTo(ddg_spice_local_map);

    var businesses = api_response.businesses;
    for (var i in businesses) {
        var location = [ businesses[i].location.coordinate.latitude,
                         businesses[i].location.coordinate.longitude ]
        if (i == 0) ddg_spice_local_map.setView(location, 13);
        ddg_spice_local_markers.push(
            L.marker(location, { 'title' : businesses[i].name, 'id' : i }
            ).on('click', function(e) {
                $('#map .leaflet-marker-icon').attr(
                    'src', '/dist/images/marker-icon.png');
                e.target._icon.src = '/dist/images/marker-icon-green.png';
            }).addTo(ddg_spice_local_map));
    }
};
